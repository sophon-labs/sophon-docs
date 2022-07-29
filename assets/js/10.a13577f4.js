(window.webpackJsonp=window.webpackJsonp||[]).push([[10],{424:function(e,t,s){"use strict";s.r(t);var a=s(35),r=Object(a.a)({},(function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[s("h1",{attrs:{id:"backup"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#backup"}},[e._v("#")]),e._v(" Backup")]),e._v(" "),s("h3",{attrs:{id:"mnemonics"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#mnemonics"}},[e._v("#")]),e._v(" Mnemonics")]),e._v(" "),s("p",[e._v("When you create a new key, you'll recieve a mnemonic phrase that can be used to restore that key. Backup the mnemonic phrase:")]),e._v(" "),s("div",{staticClass:"language-bash extra-class"},[s("pre",{pre:!0,attrs:{class:"language-bash"}},[s("code",[e._v("sophond keys "),s("span",{pre:!0,attrs:{class:"token function"}},[e._v("add")]),e._v(" mykey\n- name: mykey\n  type: "),s("span",{pre:!0,attrs:{class:"token builtin class-name"}},[e._v("local")]),e._v("\n  address: sop1ze0hajerjvp7cs8d53k955dt958h7k8uv3g90l\n  pubkey: "),s("span",{pre:!0,attrs:{class:"token string"}},[e._v('\'{"@type":"/ethermint.crypto.v1.ethsecp256k1.PubKey","key":"A1WmyTsmccEGh82C9VSGZUJUqnezNsVvJKsi2WHpB1wz"}\'')]),e._v("\n  mnemonic: "),s("span",{pre:!0,attrs:{class:"token string"}},[e._v('""')]),e._v("\n\n\n**Important** "),s("span",{pre:!0,attrs:{class:"token function"}},[e._v("write")]),e._v(" this mnemonic phrase "),s("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("in")]),e._v(" a safe place.\nIt is the only way to recover your account "),s("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("if")]),e._v(" you ever forget your password.\n\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[e._v("# <24 word mnemonic phrase>")]),e._v("\nspirit adapt kick brass evidence walk employ gauge sauce flag grass summer reward symbol blouse similar hover east shrug siege laundry end rack flag\n")])])]),s("p",[e._v("To restore the key:")]),e._v(" "),s("div",{staticClass:"language-bash extra-class"},[s("pre",{pre:!0,attrs:{class:"language-bash"}},[s("code",[e._v("sophond keys "),s("span",{pre:!0,attrs:{class:"token function"}},[e._v("add")]),e._v(" mykey-restored --recover\nspirit adapt kick brass evidence walk employ gauge sauce flag grass summer reward symbol blouse similar hover east shrug siege laundry end rack flag\n\n- name: mykey-restored\n  type: "),s("span",{pre:!0,attrs:{class:"token builtin class-name"}},[e._v("local")]),e._v("\n  address: sop1ze0hajerjvp7cs8d53k955dt958h7k8uv3g90l\n  pubkey: "),s("span",{pre:!0,attrs:{class:"token string"}},[e._v('\'{"@type":"/ethermint.crypto.v1.ethsecp256k1.PubKey","key":"A1WmyTsmccEGh82C9VSGZUJUqnezNsVvJKsi2WHpB1wz"}\'')]),e._v("\n  mnemonic: "),s("span",{pre:!0,attrs:{class:"token string"}},[e._v('""')]),e._v("\n")])])]),s("h3",{attrs:{id:"export-key"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#export-key"}},[e._v("#")]),e._v(" Export Key")]),e._v(" "),s("h4",{attrs:{id:"tendermint-formatted-private-keys"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#tendermint-formatted-private-keys"}},[e._v("#")]),e._v(" Tendermint-Formatted Private Keys")]),e._v(" "),s("p",[e._v("To backup this type of key without the mnemonic phrase, do the following:")]),e._v(" "),s("div",{staticClass:"language-bash extra-class"},[s("pre",{pre:!0,attrs:{class:"language-bash"}},[s("code",[e._v("sophond keys "),s("span",{pre:!0,attrs:{class:"token builtin class-name"}},[e._v("export")]),e._v(" mykey\nEnter passphrase to encrypt the exported key:\n-----BEGIN TENDERMINT PRIVATE KEY-----\nsalt: 561A3B8347C9C5DB0BDBF72AC8E1C54B\ntype: eth_secp256k1\nkdf: bcrypt\n\nnST8iH00o8mZ191gw4m0kYv4z6amm3ApT0g3bMeNvunyMmgxPH1reDlCbtfGaYe6\ns3stl4olPzEMVcit7A4Rzj6zimA+re8Aia9epk8"),s("span",{pre:!0,attrs:{class:"token operator"}},[e._v("=")]),e._v("\n"),s("span",{pre:!0,attrs:{class:"token operator"}},[e._v("=")]),e._v("mAmd\n-----END TENDERMINT PRIVATE KEY-----\n"),s("span",{pre:!0,attrs:{class:"token builtin class-name"}},[e._v("echo")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[e._v('"\\\n-----BEGIN TENDERMINT PRIVATE KEY-----\nsalt: 561A3B8347C9C5DB0BDBF72AC8E1C54B\ntype: eth_secp256k1\nkdf: bcrypt\n\nnST8iH00o8mZ191gw4m0kYv4z6amm3ApT0g3bMeNvunyMmgxPH1reDlCbtfGaYe6\ns3stl4olPzEMVcit7A4Rzj6zimA+re8Aia9epk8=\n=mAmd\n-----END TENDERMINT PRIVATE KEY-----"')]),e._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[e._v(">")]),e._v(" mykey.export\n")])])]),s("h4",{attrs:{id:"ethereum-formatted-private-keys"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#ethereum-formatted-private-keys"}},[e._v("#")]),e._v(" Ethereum-Formatted Private Keys")]),e._v(" "),s("p",[e._v("To backup this type of key without the mnemonic phrase, do the following:")]),e._v(" "),s("div",{staticClass:"language-bash extra-class"},[s("pre",{pre:!0,attrs:{class:"language-bash"}},[s("code",[e._v("sophond keys unsafe-export-eth-key mykey "),s("span",{pre:!0,attrs:{class:"token operator"}},[e._v(">")]),e._v(" mykey.export\n**WARNING** this is an unsafe way to "),s("span",{pre:!0,attrs:{class:"token builtin class-name"}},[e._v("export")]),e._v(" your unencrypted private key, are you sure? "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("[")]),e._v("y/N"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("]")]),e._v(": y\nEnter keyring passphrase:\n")])])]),s("h3",{attrs:{id:"import-key"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#import-key"}},[e._v("#")]),e._v(" Import Key")]),e._v(" "),s("h4",{attrs:{id:"tendermint-formatted-private-keys-2"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#tendermint-formatted-private-keys-2"}},[e._v("#")]),e._v(" Tendermint-Formatted Private Keys")]),e._v(" "),s("div",{staticClass:"language-bash extra-class"},[s("pre",{pre:!0,attrs:{class:"language-bash"}},[s("code",[e._v("sophond keys "),s("span",{pre:!0,attrs:{class:"token function"}},[e._v("import")]),e._v(" mykey-imported ./mykey.export\nEnter passphrase to decrypt your key:\n")])])]),s("h4",{attrs:{id:"ethereum-formatted-private-keys-2"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#ethereum-formatted-private-keys-2"}},[e._v("#")]),e._v(" Ethereum-Formatted Private Keys")]),e._v(" "),s("div",{staticClass:"language-bash extra-class"},[s("pre",{pre:!0,attrs:{class:"language-bash"}},[s("code",[e._v("sophond keys unsafe-import-eth-key mykey-imported ./mykey.export\nEnter passphrase to encrypt your key:\n")])])])])}),[],!1,null,null,null);t.default=r.exports}}]);