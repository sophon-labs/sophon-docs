# Gas and Fees
The concept of Gas represents the amount of computational effort required to execute specific operations on the state machine.

Gas was created on Ethereum to disallow the EVM (Ethereum Virtual Machine) from running infinite loops by allocating a small amount of monetary value into the system. A unit of gas, usually in the form of a fraction of the native coin, is consumed for every operation on the EVM and requires a user to pay for these operations. These operations consist in state transitions such as sending a transaction or calling a contract.

Exactly like Ethereum, Cosmos utilizes the concept of gas and this is how Cosmos tracks the resource usage of operations during execution. Operations on Cosmos are represented as read or writes done to the chain's store.

In Cosmos, a fee is calculated and charged to the user during a message execution. This fee is calculated from the sum of all gas consumed in a message execution. So, the fee is equivalent to the gas multiplied by the gas price.

In both networks, gas is used to make sure that operations do not require an excess amount of computational power to complete and as a way to deter bad-acting users from spamming the network.

### Cosmos Gas
In the Cosmos SDK, gas is tracked in the main GasMeter and the BlockGasMeter:

- GasMeter: keeps track of the gas consumed during executions that lead to state transitions. It is reset on every transaction execution.
- BlockGasMeter: keeps track of the gas consumed in a block and enforces that the gas does not go over a predefined limit. This limit is defined in the Tendermint consensus parameters and can be changed via governance parameter change proposals.
More information regarding gas in Cosmos SDK can be found [here](https://docs.cosmos.network/main/basics/gas-fees.html).

### Matching EVM Gas consumption
Evmos is an EVM-compatible chain that supports Ethereum Web3 tooling. For this reason, gas consumption must be equitable with other EVMs, most importantly Ethereum.

The main difference between EVM and Cosmos state transitions, is that the EVM uses a [gas table](https://github.com/ethereum/go-ethereum/blob/master/params/protocol_params.go)for each OPCODE, whereas Cosmos uses a GasConfig that charges gas for each CRUD operation by setting a flat and per-byte cost for accessing the database.
```go
// GasConfig defines gas cost for each operation on KVStores
type GasConfig struct {
	HasCost          Gas
	DeleteCost       Gas
	ReadCostFlat     Gas
	ReadCostPerByte  Gas
	WriteCostFlat    Gas
	WriteCostPerByte Gas
	IterNextCostFlat Gas
}
```
In order to match the gas consumed by the EVM, the gas consumption logic from the SDK is ignored, and instead the gas consumed is calculated by subtracting the state transition leftover gas plus refund from the gas limit defined on the message.

To ignore the SDK gas consumption, we reset the transaction `GasMeter` count to 0 and manually set it to the `gasUsed` value computed by the EVM module at the end of the execution.

```go
package keeper

import (
	"math/big"
	"os"
	"time"

	"github.com/palantir/stacktrace"
	tmtypes "github.com/tendermint/tendermint/types"

	"github.com/cosmos/cosmos-sdk/telemetry"
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	authtypes "github.com/cosmos/cosmos-sdk/x/auth/types"
	stakingtypes "github.com/cosmos/cosmos-sdk/x/staking/types"

	ethermint "github.com/tharsis/ethermint/types"
	"github.com/tharsis/ethermint/x/evm/types"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core"
	ethtypes "github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/core/vm"
	"github.com/ethereum/go-ethereum/params"
)

// NewEVM generates a go-ethereum VM from the provided Message fields and the chain parameters
// (ChainConfig and module Params). It additionally sets the validator operator address as the
// coinbase address to make it available for the COINBASE opcode, even though there is no
// beneficiary of the coinbase transaction (since we're not mining).
func (k *Keeper) NewEVM(msg core.Message, config *params.ChainConfig, params types.Params, coinbase common.Address) *vm.EVM {
	blockCtx := vm.BlockContext{
		CanTransfer: core.CanTransfer,
		Transfer:    core.Transfer,
		GetHash:     k.GetHashFn(),
		Coinbase:    coinbase,
		GasLimit:    ethermint.BlockGasLimit(k.ctx),
		BlockNumber: big.NewInt(k.ctx.BlockHeight()),
		Time:        big.NewInt(k.ctx.BlockHeader().Time.Unix()),
		Difficulty:  big.NewInt(0), // unused. Only required in PoW context
	}

	txCtx := core.NewEVMTxContext(msg)
	vmConfig := k.VMConfig(params)

	return vm.NewEVM(blockCtx, txCtx, k, config, vmConfig)
}

// VMConfig creates an EVM configuration from the debug setting and the extra EIPs enabled on the
// module parameters. The config generated uses the default JumpTable from the EVM.
func (k Keeper) VMConfig(params types.Params) vm.Config {
	return vm.Config{
		Debug:       k.debug,
		Tracer:      vm.NewJSONLogger(&vm.LogConfig{Debug: k.debug}, os.Stderr), // TODO: consider using the Struct Logger too
		NoRecursion: false,                                                      // TODO: consider disabling recursion though params
		ExtraEips:   params.EIPs(),
	}
}

// GetHashFn implements vm.GetHashFunc for Ethermint. It handles 3 cases:
//  1. The requested height matches the current height from context (and thus same epoch number)
//  2. The requested height is from an previous height from the same chain epoch
//  3. The requested height is from a height greater than the latest one
func (k Keeper) GetHashFn() vm.GetHashFunc {
	return func(height uint64) common.Hash {
		h := int64(height)
		switch {
		case k.ctx.BlockHeight() == h:
			// Case 1: The requested height matches the one from the context so we can retrieve the header
			// hash directly from the context.
			// Note: The headerHash is only set at begin block, it will be nil in case of a query context
			headerHash := k.ctx.HeaderHash()
			if len(headerHash) != 0 {
				return common.BytesToHash(headerHash)
			}

			// only recompute the hash if not set (eg: checkTxState)
			contextBlockHeader := k.ctx.BlockHeader()
			header, err := tmtypes.HeaderFromProto(&contextBlockHeader)
			if err != nil {
				k.Logger(k.ctx).Error("failed to cast tendermint header from proto", "error", err)
				return common.Hash{}
			}

			headerHash = header.Hash()
			return common.BytesToHash(headerHash)

		case k.ctx.BlockHeight() > h:
			// Case 2: if the chain is not the current height we need to retrieve the hash from the store for the
			// current chain epoch. This only applies if the current height is greater than the requested height.
			histInfo, found := k.stakingKeeper.GetHistoricalInfo(k.ctx, h)
			if !found {
				k.Logger(k.ctx).Debug("historical info not found", "height", h)
				return common.Hash{}
			}

			header, err := tmtypes.HeaderFromProto(&histInfo.Header)
			if err != nil {
				k.Logger(k.ctx).Error("failed to cast tendermint header from proto", "error", err)
				return common.Hash{}
			}

			return common.BytesToHash(header.Hash())
		default:
			// Case 3: heights greater than the current one returns an empty hash.
			return common.Hash{}
		}
	}
}

// ApplyTransaction runs and attempts to perform a state transition with the given transaction (i.e Message), that will
// only be persisted (committed) to the underlying KVStore if the transaction does not fail.
//
// Gas tracking
//
// Ethereum consumes gas according to the EVM opcodes instead of general reads and writes to store. Because of this, the
// state transition needs to ignore the SDK gas consumption mechanism defined by the GasKVStore and instead consume the
// amount of gas used by the VM execution. The amount of gas used is tracked by the EVM and returned in the execution
// result.
//
// Prior to the execution, the starting tx gas meter is saved and replaced with an infinite gas meter in a new context
// in order to ignore the SDK gas consumption config values (read, write, has, delete).
// After the execution, the gas used from the message execution will be added to the starting gas consumed, taking into
// consideration the amount of gas returned. Finally, the context is updated with the EVM gas consumed value prior to
// returning.
//
// For relevant discussion see: https://github.com/cosmos/cosmos-sdk/discussions/9072
func (k *Keeper) ApplyTransaction(tx *ethtypes.Transaction) (*types.MsgEthereumTxResponse, error) {
	defer telemetry.ModuleMeasureSince(types.ModuleName, time.Now(), types.MetricKeyTransitionDB)

	params := k.GetParams(k.ctx)
	ethCfg := params.ChainConfig.EthereumConfig(k.eip155ChainID)

	// get the latest signer according to the chain rules from the config
	signer := ethtypes.MakeSigner(ethCfg, big.NewInt(k.ctx.BlockHeight()))

	msg, err := tx.AsMessage(signer)
	if err != nil {
		return nil, stacktrace.Propagate(err, "failed to return ethereum transaction as core message")
	}

	// we use a cached context to avoid modifying to state in case EVM msg is reverted
	commit := k.BeginCachedContext()

	// get the coinbase address from the block proposer
	coinbase, err := k.GetCoinbaseAddress()
	if err != nil {
		return nil, stacktrace.Propagate(err, "failed to obtain coinbase address")
	}

	// create an ethereum EVM instance and run the message
	evm := k.NewEVM(msg, ethCfg, params, coinbase)

	txHash := tx.Hash()

	// set the transaction hash and index to the impermanent (transient) block state so that it's also
	// available on the StateDB functions (eg: AddLog)
	k.SetTxHashTransient(txHash)
	k.IncreaseTxIndexTransient()

	// pass false to execute in real mode, which do actual gas refunding
	res, err := k.ApplyMessage(evm, msg, ethCfg, false)
	if err != nil {
		return nil, stacktrace.Propagate(err, "failed to apply ethereum core message")
	}

	res.Hash = txHash.Hex()
	logs := k.GetTxLogs(txHash)

	// Commit and switch to committed context
	if !res.Failed() {
		commit()
	}

	k.EndCachedContext()

	// Logs needs to be ignored when tx is reverted
	// Set the log and bloom filter only when the tx is NOT REVERTED
	if !res.Failed() {
		res.Logs = types.NewLogsFromEth(logs)
		// Update block bloom filter in the original context because blockbloom is set in EndBlock
		bloom := k.GetBlockBloomTransient()
		bloom.Or(bloom, big.NewInt(0).SetBytes(ethtypes.LogsBloom(logs)))
		k.SetBlockBloomTransient(bloom)
	}

	// update the gas used after refund
	k.resetGasMeterAndConsumeGas(res.GasUsed)
	return res, nil
}

// Gas consumption notes (write doc from this)

// gas = remaining gas = limit - consumed

// Gas consumption in ethereum:
// 0. Buy gas -> deduct gasLimit * gasPrice from user account
// 		0.1 leftover gas = gas limit
// 1. consume intrinsic gas
//   1.1 leftover gas = leftover gas - intrinsic gas
// 2. Exec vm functions by passing the gas (i.e remaining gas)
//   2.1 final leftover gas returned after spending gas from the opcodes jump tables
// 3. Refund amount =  max(gasConsumed / 2, gas refund), where gas refund is a local variable

// TODO: (@fedekunze) currently we consume the entire gas limit in the ante handler, so if a transaction fails
// the amount spent will be grater than the gas spent in an Ethereum tx (i.e here the leftover gas won't be refunded).

// ApplyMessage computes the new state by applying the given message against the existing state.
// If the message fails, the VM execution error with the reason will be returned to the client
// and the transaction won't be committed to the store.
//
// Reverted state
//
// The transaction is never "reverted" since there is no snapshot + rollback performed on the StateDB.
// Only successful transactions are written to the store during DeliverTx mode.
//
// Prechecks and Preprocessing
//
// All relevant state transition prechecks for the MsgEthereumTx are performed on the AnteHandler,
// prior to running the transaction against the state. The prechecks run are the following:
//
// 1. the nonce of the message caller is correct
// 2. caller has enough balance to cover transaction fee(gaslimit * gasprice)
// 3. the amount of gas required is available in the block
// 4. the purchased gas is enough to cover intrinsic usage
// 5. there is no overflow when calculating intrinsic gas
// 6. caller has enough balance to cover asset transfer for **topmost** call
//
// The preprocessing steps performed by the AnteHandler are:
//
// 1. set up the initial access list (iff fork > Berlin)
//
// Query mode
//
// The gRPC query endpoint from 'eth_call' calls this method in query mode, and since the query handler don't call AnteHandler,
// so we don't do real gas refund in that case.
func (k *Keeper) ApplyMessage(evm *vm.EVM, msg core.Message, cfg *params.ChainConfig, query bool) (*types.MsgEthereumTxResponse, error) {
	var (
		ret   []byte // return bytes from evm execution
		vmErr error  // vm errors do not effect consensus and are therefore not assigned to err
	)

	sender := vm.AccountRef(msg.From())
	contractCreation := msg.To() == nil

	intrinsicGas, err := k.GetEthIntrinsicGas(msg, cfg, contractCreation)
	if err != nil {
		// should have already been checked on Ante Handler
		return nil, stacktrace.Propagate(err, "intrinsic gas failed")
	}
	// Should check again even if it is checked on Ante Handler, because eth_call don't go through Ante Handler.
	if msg.Gas() < intrinsicGas {
		// eth_estimateGas will check for this exact error
		return nil, stacktrace.Propagate(core.ErrIntrinsicGas, "apply message")
	}
	leftoverGas := msg.Gas() - intrinsicGas

	if contractCreation {
		ret, _, leftoverGas, vmErr = evm.Create(sender, msg.Data(), leftoverGas, msg.Value())
	} else {
		ret, leftoverGas, vmErr = evm.Call(sender, *msg.To(), msg.Data(), leftoverGas, msg.Value())
	}

	if query {
		// gRPC query handlers don't go through the AnteHandler to deduct the gas fee from the sender or have access historical state.
		// We don't refund gas to the sender.
		// For more info, see: https://github.com/tharsis/ethermint/issues/229 and https://github.com/cosmos/cosmos-sdk/issues/9636
		leftoverGas += k.GasToRefund(msg.Gas() - leftoverGas)
	} else {
		// refund gas prior to handling the vm error in order to match the Ethereum gas consumption instead of the default SDK one.
		leftoverGas, err = k.RefundGas(msg, leftoverGas)
		if err != nil {
			return nil, stacktrace.Propagate(err, "failed to refund gas leftover gas to sender %s", msg.From())
		}
	}

	// EVM execution error needs to be available for the JSON-RPC client
	var vmError string
	if vmErr != nil {
		vmError = vmErr.Error()
	}

	gasUsed := msg.Gas() - leftoverGas
	return &types.MsgEthereumTxResponse{
		GasUsed: gasUsed,
		VmError: vmError,
		Ret:     ret,
	}, nil
}

// GetEthIntrinsicGas returns the intrinsic gas cost for the transaction
func (k *Keeper) GetEthIntrinsicGas(msg core.Message, cfg *params.ChainConfig, isContractCreation bool) (uint64, error) {
	height := big.NewInt(k.ctx.BlockHeight())
	homestead := cfg.IsHomestead(height)
	istanbul := cfg.IsIstanbul(height)

	return core.IntrinsicGas(msg.Data(), msg.AccessList(), isContractCreation, homestead, istanbul)
}

// GasToRefund calculates the amount of gas the state machine should refund to the sender. It is
// capped by half of the gas consumed.
func (k *Keeper) GasToRefund(gasConsumed uint64) uint64 {
	// Apply refund counter, capped to half of the used gas.
	refund := gasConsumed / 2
	availableRefund := k.GetRefund()
	if refund > availableRefund {
		return availableRefund
	}
	return refund
}

// RefundGas transfers the leftover gas to the sender of the message, caped to half of the total gas
// consumed in the transaction. Additionally, the function sets the total gas consumed to the value
// returned by the EVM execution, thus ignoring the previous intrinsic gas consumed during in the
// AnteHandler.
func (k *Keeper) RefundGas(msg core.Message, leftoverGas uint64) (uint64, error) {
	// safety check: leftover gas after execution should never exceed the gas limit defined on the message
	if leftoverGas > msg.Gas() {
		return leftoverGas, stacktrace.Propagate(
			sdkerrors.Wrapf(types.ErrInconsistentGas, "leftover gas cannot be greater than gas limit (%d > %d)", leftoverGas, msg.Gas()),
			"failed to update gas consumed after refund of leftover gas",
		)
	}

	gasConsumed := msg.Gas() - leftoverGas

	// calculate available gas to refund and add it to the leftover gas amount
	refund := k.GasToRefund(gasConsumed)
	leftoverGas += refund

	// safety check: leftover gas after refund should never exceed the gas limit defined on the message
	if leftoverGas > msg.Gas() {
		return leftoverGas, stacktrace.Propagate(
			sdkerrors.Wrapf(types.ErrInconsistentGas, "leftover gas cannot be greater than gas limit (%d > %d)", leftoverGas, msg.Gas()),
			"failed to update gas consumed after refund of %d gas", refund,
		)
	}

	// Return EVM tokens for remaining gas, exchanged at the original rate.
	remaining := new(big.Int).Mul(new(big.Int).SetUint64(leftoverGas), msg.GasPrice())

	switch remaining.Sign() {
	case -1:
		// negative refund errors
		return leftoverGas, sdkerrors.Wrapf(types.ErrInvalidRefund, "refunded amount value cannot be negative %d", remaining.Int64())
	case 1:
		// positive amount refund
		params := k.GetParams(k.ctx)
		refundedCoins := sdk.Coins{sdk.NewCoin(params.EvmDenom, sdk.NewIntFromBigInt(remaining))}

		// refund to sender from the fee collector module account, which is the escrow account in charge of collecting tx fees

		err := k.bankKeeper.SendCoinsFromModuleToAccount(k.ctx, authtypes.FeeCollectorName, msg.From().Bytes(), refundedCoins)
		if err != nil {
			err = sdkerrors.Wrapf(sdkerrors.ErrInsufficientFunds, "fee collector account failed to refund fees: %s", err.Error())
			return leftoverGas, stacktrace.Propagate(err, "failed to refund %d leftover gas (%s)", leftoverGas, refundedCoins.String())
		}
	default:
		// no refund, consume gas and update the tx gas meter
	}

	return leftoverGas, nil
}

// resetGasMeterAndConsumeGas reset first the gas meter consumed value to zero and set it back to the new value
// 'gasUsed'
func (k *Keeper) resetGasMeterAndConsumeGas(gasUsed uint64) {
	// reset the gas count
	k.ctx.GasMeter().RefundGas(k.ctx.GasMeter().GasConsumed(), "reset the gas count")
	k.ctx.GasMeter().ConsumeGas(gasUsed, "apply evm transaction")
}

// GetCoinbaseAddress returns the block proposer's validator operator address.
func (k Keeper) GetCoinbaseAddress() (common.Address, error) {
	consAddr := sdk.ConsAddress(k.ctx.BlockHeader().ProposerAddress)
	validator, found := k.stakingKeeper.GetValidatorByConsAddr(k.ctx, consAddr)
	if !found {
		return common.Address{}, stacktrace.Propagate(
			sdkerrors.Wrap(stakingtypes.ErrNoValidatorFound, consAddr.String()),
			"failed to retrieve validator from block proposer address",
		)
	}

	coinbase := common.BytesToAddress(validator.GetOperator())
	return coinbase, nil
}
```
#### `AnteHandler`
The Cosmos SDK [AnteHandler](https://docs.cosmos.network/main/basics/gas-fees.html#antehandler) performs basic checks prior to transaction execution. These checks are usually signature verification, transaction field validation, transaction fees, etc.

Regarding gas consumption and fees, the `AnteHandler` checks that the user has enough balance to cover for the tx cost (amount plus fees) as well as checking that the gas limit defined in the message is greater or equal than the computed intrinsic gas for the message.

### Gas Refunds
In the EVM, gas can be specified prior to execution. The totality of the gas specified is consumed at the beginning of the execution (during the AnteHandler step) and the remaining gas is refunded back to the user if any gas is left over after the execution. Additionally the EVM can also define gas to be refunded back to the user but those will be capped to a fraction of the used gas depending on the fork/version being used.

### 0 Fee Transactions
In Cosmos, a minimum gas price is not enforced by the AnteHandler as the min-gas-prices is checked against the local node/validator. In other words, the minimum fees accepted are determined by the validators of the network, and each validator can specify a different minimum value for their fees. This potentially allows end users to submit 0 fee transactions if there is at least one single validator that is willing to include transactions with 0 gas price in their blocks proposed.

For this same reason, in Evmos it is possible to send transactions with 0 fees for transaction types other than the ones defined by the evm module. EVM module transactions cannot have 0 fees as gas is required inherently by the EVM. This check is done by the EVM transactions stateless validation (i.e ValidateBasic) function as well as on the custom AnteHandler defined by Evmos.

### Gas estimation
Ethereum provides a JSON-RPC endpoint eth_estimateGas to help users set up a correct gas limit in their transactions.

Unfortunately, we cannot make use of the SDK tx simulation for gas estimation because the pre-check in the Ante Handlers would require a valid signature, and the sender balance to be enough to pay for the gas. But in Ethereum, this endpoint can be called without specifying any sender address.

For that reason, a specific query API EstimateGas is implemented in Evmos. It will apply the transaction against the current block/state and perform a binary search in order to find the optimal gas value to return to the user (the same transaction will be applied over and over until we find the minimum gas needed before it fails). The reason we need to use a binary search is that the gas required for the transaction might be higher than the value returned by the EVM after applying the transaction, so we need to try until we find the optimal value.

A cache context will be used during the whole execution to avoid changes be persisted in the state.
```go
package keeper

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/palantir/stacktrace"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/cosmos/cosmos-sdk/store/prefix"
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	"github.com/cosmos/cosmos-sdk/types/query"

	ethcmn "github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/core"
	ethtypes "github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/core/vm"
	ethparams "github.com/ethereum/go-ethereum/params"

	ethermint "github.com/tharsis/ethermint/types"
	"github.com/tharsis/ethermint/x/evm/types"
)

var _ types.QueryServer = Keeper{}

// Account implements the Query/Account gRPC method
func (k Keeper) Account(c context.Context, req *types.QueryAccountRequest) (*types.QueryAccountResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "empty request")
	}

	if err := ethermint.ValidateAddress(req.Address); err != nil {
		return nil, status.Error(
			codes.InvalidArgument, err.Error(),
		)
	}

	addr := ethcmn.HexToAddress(req.Address)

	ctx := sdk.UnwrapSDKContext(c)
	k.WithContext(ctx)

	return &types.QueryAccountResponse{
		Balance:  k.GetBalance(addr).String(),
		CodeHash: k.GetCodeHash(addr).Hex(),
		Nonce:    k.GetNonce(addr),
	}, nil
}

func (k Keeper) CosmosAccount(c context.Context, req *types.QueryCosmosAccountRequest) (*types.QueryCosmosAccountResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "empty request")
	}

	if err := ethermint.ValidateAddress(req.Address); err != nil {
		return nil, status.Error(
			codes.InvalidArgument, err.Error(),
		)
	}

	ctx := sdk.UnwrapSDKContext(c)
	k.WithContext(ctx)

	ethAddr := ethcmn.HexToAddress(req.Address)
	cosmosAddr := sdk.AccAddress(ethAddr.Bytes())

	account := k.accountKeeper.GetAccount(ctx, cosmosAddr)
	res := types.QueryCosmosAccountResponse{
		CosmosAddress: cosmosAddr.String(),
	}

	if account != nil {
		res.Sequence = account.GetSequence()
		res.AccountNumber = account.GetAccountNumber()
	}

	return &res, nil
}

func (k Keeper) ValidatorAccount(c context.Context, req *types.QueryValidatorAccountRequest) (*types.QueryValidatorAccountResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "empty request")
	}

	consAddr, err := sdk.ConsAddressFromBech32(req.ConsAddress)
	if err != nil {
		return nil, status.Error(
			codes.InvalidArgument, err.Error(),
		)
	}

	ctx := sdk.UnwrapSDKContext(c)
	k.WithContext(ctx)

	validator, found := k.stakingKeeper.GetValidatorByConsAddr(ctx, consAddr)
	if !found {
		return nil, nil
	}

	accAddr := sdk.AccAddress(validator.GetOperator())

	res := types.QueryValidatorAccountResponse{
		AccountAddress: accAddr.String(),
	}

	account := k.accountKeeper.GetAccount(ctx, accAddr)
	if account != nil {
		res.Sequence = account.GetSequence()
		res.AccountNumber = account.GetAccountNumber()
	}

	return &res, nil

}

// Balance implements the Query/Balance gRPC method
func (k Keeper) Balance(c context.Context, req *types.QueryBalanceRequest) (*types.QueryBalanceResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "empty request")
	}

	if err := ethermint.ValidateAddress(req.Address); err != nil {
		return nil, status.Error(
			codes.InvalidArgument,
			types.ErrZeroAddress.Error(),
		)
	}

	ctx := sdk.UnwrapSDKContext(c)
	k.WithContext(ctx)

	balanceInt := k.GetBalance(ethcmn.HexToAddress(req.Address))

	return &types.QueryBalanceResponse{
		Balance: balanceInt.String(),
	}, nil
}

// Storage implements the Query/Storage gRPC method
func (k Keeper) Storage(c context.Context, req *types.QueryStorageRequest) (*types.QueryStorageResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "empty request")
	}

	if err := ethermint.ValidateAddress(req.Address); err != nil {
		return nil, status.Error(
			codes.InvalidArgument,
			types.ErrZeroAddress.Error(),
		)
	}

	ctx := sdk.UnwrapSDKContext(c)
	k.WithContext(ctx)

	address := ethcmn.HexToAddress(req.Address)
	key := ethcmn.HexToHash(req.Key)

	state := k.GetState(address, key)
	stateHex := state.Hex()

	return &types.QueryStorageResponse{
		Value: stateHex,
	}, nil
}

// Code implements the Query/Code gRPC method
func (k Keeper) Code(c context.Context, req *types.QueryCodeRequest) (*types.QueryCodeResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "empty request")
	}

	if err := ethermint.ValidateAddress(req.Address); err != nil {
		return nil, status.Error(
			codes.InvalidArgument,
			types.ErrZeroAddress.Error(),
		)
	}

	ctx := sdk.UnwrapSDKContext(c)
	k.WithContext(ctx)

	address := ethcmn.HexToAddress(req.Address)
	code := k.GetCode(address)

	return &types.QueryCodeResponse{
		Code: code,
	}, nil
}

// TxLogs implements the Query/TxLogs gRPC method
func (k Keeper) TxLogs(c context.Context, req *types.QueryTxLogsRequest) (*types.QueryTxLogsResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "empty request")
	}

	if ethermint.IsEmptyHash(req.Hash) {
		return nil, status.Error(
			codes.InvalidArgument,
			types.ErrEmptyHash.Error(),
		)
	}

	ctx := sdk.UnwrapSDKContext(c)
	k.WithContext(ctx)

	hash := ethcmn.HexToHash(req.Hash)
	logs := k.GetTxLogs(hash)

	return &types.QueryTxLogsResponse{
		Logs: types.NewLogsFromEth(logs),
	}, nil
}

// BlockLogs implements the Query/BlockLogs gRPC method
func (k Keeper) BlockLogs(c context.Context, req *types.QueryBlockLogsRequest) (*types.QueryBlockLogsResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "empty request")
	}

	if ethermint.IsEmptyHash(req.Hash) {
		return nil, status.Error(
			codes.InvalidArgument,
			types.ErrEmptyHash.Error(),
		)
	}

	ctx := sdk.UnwrapSDKContext(c)

	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefixLogs)
	txLogs := []types.TransactionLogs{}

	pageRes, err := query.FilteredPaginate(store, req.Pagination, func(_, value []byte, accumulate bool) (bool, error) {
		var txLog types.TransactionLogs
		k.cdc.MustUnmarshal(value, &txLog)

		if len(txLog.Logs) > 0 && txLog.Logs[0].BlockHash == req.Hash {
			if accumulate {
				txLogs = append(txLogs, txLog)
			}
			return true, nil
		}

		return false, nil
	})

	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}

	return &types.QueryBlockLogsResponse{
		TxLogs:     txLogs,
		Pagination: pageRes,
	}, nil
}

// BlockBloom implements the Query/BlockBloom gRPC method
func (k Keeper) BlockBloom(c context.Context, req *types.QueryBlockBloomRequest) (*types.QueryBlockBloomResponse, error) {
	ctx := sdk.UnwrapSDKContext(c)

	bloom, found := k.GetBlockBloom(ctx, req.Height)
	if !found {
		// if the bloom is not found, query the transient store at the current height
		k.ctx = ctx
		bloomInt := k.GetBlockBloomTransient()

		if bloomInt.Sign() == 0 {
			return nil, status.Error(
				codes.NotFound, sdkerrors.Wrapf(types.ErrBloomNotFound, "height: %d", req.Height).Error(),
			)
		}

		bloom = ethtypes.BytesToBloom(bloomInt.Bytes())
	}

	return &types.QueryBlockBloomResponse{
		Bloom: bloom.Bytes(),
	}, nil
}

// Params implements the Query/Params gRPC method
func (k Keeper) Params(c context.Context, _ *types.QueryParamsRequest) (*types.QueryParamsResponse, error) {
	ctx := sdk.UnwrapSDKContext(c)
	params := k.GetParams(ctx)

	return &types.QueryParamsResponse{
		Params: params,
	}, nil
}

// StaticCall implements Query/StaticCall gRPCP method
func (k Keeper) StaticCall(c context.Context, req *types.QueryStaticCallRequest) (*types.QueryStaticCallResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "empty request")
	}

	// ctx := sdk.UnwrapSDKContext(c)
	// k.WithContext(ctx)

	// // parse the chainID from a string to a base-10 integer
	// chainIDEpoch, err := ethermint.ParseChainID(ctx.ChainID())
	// if err != nil {
	// 	return nil, status.Error(codes.Internal, err.Error())
	// }

	// txHash := tmtypes.Tx(ctx.TxBytes()).Hash()
	// ethHash := ethcmn.BytesToHash(txHash)

	// var recipient *ethcmn.Address
	// if len(req.Address) > 0 {
	// 	addr := ethcmn.HexToAddress(req.Address)
	// 	recipient = &addr
	// }

	// so := k.GetOrNewStateObject(*recipient)
	// sender := ethcmn.HexToAddress("0xaDd00275E3d9d213654Ce5223f0FADE8b106b707")

	// msg := types.NewTx(
	// 	chainIDEpoch, so.Nonce(), recipient, big.NewInt(0), 100000000, big.NewInt(0), req.Input, nil,
	// )
	// msg.From = sender.Hex()

	// if err := msg.ValidateBasic(); err != nil {
	// 	return nil, status.Error(codes.Internal, err.Error())
	// }

	// ethMsg, err := msg.AsMessage()
	// if err != nil {
	// 	return nil, status.Error(codes.Internal, err.Error())
	// }

	// st := &types.StateTransition{
	// 	Message:  ethMsg,
	// 	Csdb:     k.WithContext(ctx),
	// 	ChainID:  chainIDEpoch,
	// 	TxHash:   &ethHash,
	// 	Simulate: ctx.IsCheckTx(),
	// 	Debug:    false,
	// }

	// config, found := k.GetChainConfig(ctx)
	// if !found {
	// 	return nil, status.Error(codes.Internal, types.ErrChainConfigNotFound.Error())
	// }

	// ret, err := st.StaticCall(ctx, config)
	// if err != nil {
	// 	return nil, status.Error(codes.Internal, err.Error())
	// }

	// return &types.QueryStaticCallResponse{Data: ret}, nil

	return nil, nil
}

// EthCall implements eth_call rpc api.
func (k Keeper) EthCall(c context.Context, req *types.EthCallRequest) (*types.MsgEthereumTxResponse, error) {
	ctx := sdk.UnwrapSDKContext(c)
	k.WithContext(ctx)

	var args types.CallArgs
	err := json.Unmarshal(req.Args, &args)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, err.Error())
	}

	msg := args.ToMessage(req.GasCap)

	params := k.GetParams(ctx)
	ethCfg := params.ChainConfig.EthereumConfig(k.eip155ChainID)

	coinbase, err := k.GetCoinbaseAddress()
	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}

	evm := k.NewEVM(msg, ethCfg, params, coinbase)
	// pass true means execute in query mode, which don't do actual gas refund.
	res, err := k.ApplyMessage(evm, msg, ethCfg, true)
	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}

	return res, nil
}

// EstimateGas implements eth_estimateGas rpc api.
func (k Keeper) EstimateGas(c context.Context, req *types.EthCallRequest) (*types.EstimateGasResponse, error) {
	ctx := sdk.UnwrapSDKContext(c)
	k.WithContext(ctx)

	if req.GasCap < ethparams.TxGas {
		return nil, status.Error(codes.InvalidArgument, "gas cap cannot be lower than 21,000")
	}

	var args types.CallArgs
	err := json.Unmarshal(req.Args, &args)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, err.Error())
	}

	// Binary search the gas requirement, as it may be higher than the amount used
	var (
		lo  = ethparams.TxGas - 1
		hi  uint64
		cap uint64
	)

	// Determine the highest gas limit can be used during the estimation.
	if args.Gas != nil && uint64(*args.Gas) >= ethparams.TxGas {
		hi = uint64(*args.Gas)
	} else {
		// Query block gas limit
		params := ctx.ConsensusParams()
		if params != nil && params.Block != nil && params.Block.MaxGas > 0 {
			hi = uint64(params.Block.MaxGas)
		} else {
			hi = req.GasCap
		}
	}

	// TODO Recap the highest gas limit with account's available balance.

	// Recap the highest gas allowance with specified gascap.
	if req.GasCap != 0 && hi > req.GasCap {
		hi = req.GasCap
	}
	cap = hi

	params := k.GetParams(ctx)
	ethCfg := params.ChainConfig.EthereumConfig(k.eip155ChainID)

	coinbase, err := k.GetCoinbaseAddress()
	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}

	// Create a helper to check if a gas allowance results in an executable transaction
	executable := func(gas uint64) (bool, *types.MsgEthereumTxResponse, error) {
		args.Gas = (*hexutil.Uint64)(&gas)

		// Execute the call in an isolated context
		k.BeginCachedContext()

		msg := args.ToMessage(req.GasCap)
		evm := k.NewEVM(msg, ethCfg, params, coinbase)
		// pass true means execute in query mode, which don't do actual gas refund.
		rsp, err := k.ApplyMessage(evm, msg, ethCfg, true)

		k.EndCachedContext()

		if err != nil {
			if errors.Is(stacktrace.RootCause(err), core.ErrIntrinsicGas) {
				return true, nil, nil // Special case, raise gas limit
			}
			return true, nil, err // Bail out
		}
		return len(rsp.VmError) > 0, rsp, nil
	}

	// Execute the binary search and hone in on an executable gas limit
	hi, err = types.BinSearch(lo, hi, executable)
	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}

	// Reject the transaction as invalid if it still fails at the highest allowance
	if hi == cap {
		failed, result, err := executable(hi)
		if err != nil {
			return nil, status.Error(codes.Internal, err.Error())
		}
		if failed {
			if result != nil && result.VmError != vm.ErrOutOfGas.Error() {
				if result.VmError == vm.ErrExecutionReverted.Error() {
					return nil, types.NewExecErrorWithReason(result.Ret)
				}
				return nil, status.Error(codes.Internal, result.VmError)
			}
			// Otherwise, the specified gas cap is too low
			return nil, status.Error(codes.Internal, fmt.Sprintf("gas required exceeds allowance (%d)", cap))
		}
	}
	return &types.EstimateGasResponse{Gas: hi}, nil
}

```