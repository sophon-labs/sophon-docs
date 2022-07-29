# Transactions

### Transaction Confirmations

### Transaction Types
#### Cosmos Transactions
#### Ethereum Transactions
Ethereum transactions refer to actions initiated by EOAs (externally-owned accounts, managed by humans), rather than internal smart contract calls. Ethereum transactions transform the state of the EVM and therefore must be broadcasted to the entire network.

Ethereum transactions also require a fee, known as gas. ([EIP-1559](https://eips.ethereum.org/EIPS/eip-1559)) introduced the idea of a base fee, along with a priority fee which serves as an incentive for miners to include specific transactions in blocks.

There are several categories of Ethereum transactions:

regular transactions: transactions from one account to another
contract deployment transactions: transactions without a to address, where the contract code is sent in the data field
execution of a contract: transactions that interact with a deployed smart contract, where the to address is the smart contract address
For more information on Ethereum transactions and the transaction lifecycle, go here (opens new window).

Sophon supports the following Ethereum transactions.

Note: Unprotected legacy transactions are not supported by default.
- Dynamic Fee Transactions ([EIP-1559](https://eips.ethereum.org/EIPS/eip-1559))
- Access List Transactions ([EIP-2930](https://eips.ethereum.org/EIPS/eip-2930))
- Legacy Transactions ([EIP-2718](https://eips.ethereum.org/EIPS/eip-2718))

#### Interchain Transactions
### Transaction Receipts
