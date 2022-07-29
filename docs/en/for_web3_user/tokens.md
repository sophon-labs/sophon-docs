# Tokens

### Introduction
Sophon is a Cosmos-based chain with full Ethereum Virtual Machine (EVM) and WASM support. Because of this architecture, tokens and assets in the network may come from different independent sources.

### The Sophon Token
The denomination used for staking, governance and gas consumption on the EVM is the SOP. The SOP provides the utility of: securing the Proof-of-Stake chain, token used for governance proposals, distribution of fees to validator and users, and as a mean of gas for running smart contracts on the EVM.

Sophon uses [Atto](https://en.wikipedia.org/wiki/Atto-) SOP as the base denomination to maintain parity with Ethereum.

1 sop = $10^{18}$ asop

This matches Ethereum denomination of:

1 ETH = $10^{18}$ wei

### Cosmos Coins
Accounts can own Cosmos coins in their balance, which are used for operations with other Cosmos and transactions. Examples of these are using the coins for staking, IBC transfers, governance deposits and EVM.

### EVM Tokens
Evmos is compatible with ERC20 tokens and other non-fungible token standards (EIP721, EIP1155) that are natively supported by the EVM.

### WASM Tokens
CW20 is a specification for fungible tokens based on CosmWasm. The name and design is loosely based on Ethereum’s ERC20 standard, but many changes have been made. The types in here can be imported by contracts that wish to implement this spec, or by contracts that call to any standard CW20 contract.