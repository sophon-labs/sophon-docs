# MetaMask

The [MetaMask](https://metamask.io/) browser extension is a wallet for accessing Ethereum-enabled applications and managing user identities. It can be used to connect to Sophon through the official testnet or via a locally-running Sophon node.

If you are planning on developing on Sophon locally and you haven’t already set up your own local node, refer to the quickstart tutorial(TODO), or follow the instructions in the GitHub repository (TODO).

### Adding a New Network
Open the MetaMask extension on your browser, you may have to log in to your MetaMask account if you are not already. Then click the top right circle and go to `Settings` > `Networks` > `Add Network` and fill the form as shown below.

You can also lookup the [EIP155](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md) Chain ID by referring to [chainlist.org](https://chainlist.org/). Alternatively, to get the full Chain ID from Genesis, check the Chain ID documentation page.

[//]:TODO # (![metamask]&#40;~@static/metamask.png&#41;&#41;) TODO

### Import Account to Metamask
Close the `Settings`, go to `My Accounts` (top right circle) and select `Import Account`. You should see an image like the following one:

[//]:TODO # (![metamask]&#40;~@static/importacc.png&#41;&#41;)
Now you can export your private key from the terminal using the following command. Again, make sure to replace `mykey` with the name of the key that you want to export and use the correct keyring-backend:
```bash
sophond keys unsafe-export-eth-key mykey
```
Go back to the browser and select the `Private Key` option. Then paste the private key exported from the `unsafe-export-eth-key` command.

### Reset Account
If you used your Metamask account for a legacy testnet/mainnet upgrade, you will need to reset your account in order to use it with the new network. This will clear your account's transaction history, but it won't change the balances in your accounts or require you to re-enter your `Secret Recovery Phrase`.
Go to `Settings` > `Advanced` and click the `Reset Account` button.

### Download Account State
To see your Metamask logs, click the top right circle and go to `Settings` > `Advanced` > `State Logs`. If you search through the JSON file for the account address you'll find the transaction history.