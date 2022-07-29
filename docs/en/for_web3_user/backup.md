# Backup

### Mnemonics
When you create a new key, you'll recieve a mnemonic phrase that can be used to restore that key. Backup the mnemonic phrase:
```bash
sophond keys add mykey
- name: mykey
  type: local
  address: sop1ze0hajerjvp7cs8d53k955dt958h7k8uv3g90l
  pubkey: '{"@type":"/ethermint.crypto.v1.ethsecp256k1.PubKey","key":"A1WmyTsmccEGh82C9VSGZUJUqnezNsVvJKsi2WHpB1wz"}'
  mnemonic: ""


**Important** write this mnemonic phrase in a safe place.
It is the only way to recover your account if you ever forget your password.

# <24 word mnemonic phrase>
spirit adapt kick brass evidence walk employ gauge sauce flag grass summer reward symbol blouse similar hover east shrug siege laundry end rack flag
```
To restore the key:
```bash
sophond keys add mykey-restored --recover
spirit adapt kick brass evidence walk employ gauge sauce flag grass summer reward symbol blouse similar hover east shrug siege laundry end rack flag

- name: mykey-restored
  type: local
  address: sop1ze0hajerjvp7cs8d53k955dt958h7k8uv3g90l
  pubkey: '{"@type":"/ethermint.crypto.v1.ethsecp256k1.PubKey","key":"A1WmyTsmccEGh82C9VSGZUJUqnezNsVvJKsi2WHpB1wz"}'
  mnemonic: ""
```

### Export Key
#### Tendermint-Formatted Private Keys
To backup this type of key without the mnemonic phrase, do the following:
```bash
sophond keys export mykey
Enter passphrase to encrypt the exported key:
-----BEGIN TENDERMINT PRIVATE KEY-----
salt: 561A3B8347C9C5DB0BDBF72AC8E1C54B
type: eth_secp256k1
kdf: bcrypt

nST8iH00o8mZ191gw4m0kYv4z6amm3ApT0g3bMeNvunyMmgxPH1reDlCbtfGaYe6
s3stl4olPzEMVcit7A4Rzj6zimA+re8Aia9epk8=
=mAmd
-----END TENDERMINT PRIVATE KEY-----
echo "\
-----BEGIN TENDERMINT PRIVATE KEY-----
salt: 561A3B8347C9C5DB0BDBF72AC8E1C54B
type: eth_secp256k1
kdf: bcrypt

nST8iH00o8mZ191gw4m0kYv4z6amm3ApT0g3bMeNvunyMmgxPH1reDlCbtfGaYe6
s3stl4olPzEMVcit7A4Rzj6zimA+re8Aia9epk8=
=mAmd
-----END TENDERMINT PRIVATE KEY-----" > mykey.export
```
#### Ethereum-Formatted Private Keys
To backup this type of key without the mnemonic phrase, do the following:
```bash
sophond keys unsafe-export-eth-key mykey > mykey.export
**WARNING** this is an unsafe way to export your unencrypted private key, are you sure? [y/N]: y
Enter keyring passphrase:
```

### Import Key
#### Tendermint-Formatted Private Keys
```bash
sophond keys import mykey-imported ./mykey.export
Enter passphrase to decrypt your key:
```
#### Ethereum-Formatted Private Keys
```bash
sophond keys unsafe-import-eth-key mykey-imported ./mykey.export
Enter passphrase to encrypt your key:
```