# Multisig 

[//]: # (TODO) importing multisig cause app crashed
A **multisig account** is an Evmos account with a special key that can require more than one signature to sign transactions. This can be useful for increasing the security of the account or for requiring the consent of multiple parties to make transactions. Multisig accounts can be created by specifying:

- threshold number of signatures required
- the public keys involved in signing

To sign with a multisig account, the transaction must be signed individually by the different keys specified for the account. Then, the signatures will be combined into a multisignature which can be used to sign the transaction. If fewer than the threshold number of signatures needed are present, the resultant multisignature is considered invalid.

### Generate a Multisig key
```bash
sophond keys add --multisig=name1,name2,name3[...] --multisig-threshold=K new_key_name
```

`K` is the minimum number of private keys that must have signed the transactions that carry the public key's address as signer.

The `--multisig` flag must contain the name of public keys that will be combined into a public key that will be generated and stored as `new_key_name` in the local database. All names supplied through `--multisig` must already exist in the local database.

Unless the flag `--nosort` is set, the order in which the keys are supplied on the command line does not matter, i.e. the following commands generate two identical keys:

```bash
sophond keys add --multisig=p1,p2,p3 --multisig-threshold=2 multisig_address
sophond keys add --multisig=p2,p3,p1 --multisig-threshold=2 multisig_address
```

Multisig addresses can also be generated on-the-fly and printed through the which command:

```bash
sophond keys show --multisig-threshold=K name1 name2 name3 [...]
```

### Signing a transaction

#### Step 1: Create the multisig key
Let's assume that you have `test1` and `test2` want to make a multisig account with `test3`.

First import the public keys of `test3` into your keyring.

```bash
sophond keys add \
    test3 \
    --pubkey='{"@type":"/ethermint.crypto.v1.ethsecp256k1.PubKey","key":"Ak0uhJFaqWzxhYCQxoBi6zJaJUtlDJ9+RZeXKg76HouG"}'
```

Generate the multisig key with 2/3 threshold.

```bash
sophond keys add \
    multi \
    --multisig=alice,bob,test3 \
    --multisig-threshold=2
```

You can see its address and details: