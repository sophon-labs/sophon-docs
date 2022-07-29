/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "404.html",
    "revision": "36cc89bfc072e230029ac691e20ac141"
  },
  {
    "url": "assets/css/0.styles.9f4aaddc.css",
    "revision": "f893f5be58e487f6c8ee21cd319f183c"
  },
  {
    "url": "assets/img/search.83621669.svg",
    "revision": "83621669651b9a3d4bf64d1a670ad856"
  },
  {
    "url": "assets/js/10.a13577f4.js",
    "revision": "69f0d9b365202ff0974ef494bda9154d"
  },
  {
    "url": "assets/js/11.d2336c4a.js",
    "revision": "d1461decd650a6a5b6205d4fd9425f12"
  },
  {
    "url": "assets/js/12.481e56ea.js",
    "revision": "01364351c1e04ac9bcd19a9d16721265"
  },
  {
    "url": "assets/js/13.8cd42a12.js",
    "revision": "93667d1bba95b1fe222f3401e8c69bd8"
  },
  {
    "url": "assets/js/14.22839b7c.js",
    "revision": "e8f4f7fde6bf158d94a028956e157dc7"
  },
  {
    "url": "assets/js/15.f112457b.js",
    "revision": "6f74c18dd682b71741510cb651418e27"
  },
  {
    "url": "assets/js/16.89f97260.js",
    "revision": "f4682856ca3f34d4d1d26cccf8991213"
  },
  {
    "url": "assets/js/17.5c101dfb.js",
    "revision": "741a96b063e1f33b350ad99ea0149a57"
  },
  {
    "url": "assets/js/18.3250cd7c.js",
    "revision": "c8fccf3b5201a78c3330c32a030a09e7"
  },
  {
    "url": "assets/js/19.3f60a875.js",
    "revision": "91dbd46c47f426c8a7a3166d1fd4b644"
  },
  {
    "url": "assets/js/20.6d044db7.js",
    "revision": "e5ec97f48f6c4644055d03a7acedbfef"
  },
  {
    "url": "assets/js/21.16fed355.js",
    "revision": "a4cdcb5a795021bd585b08e480f71a9d"
  },
  {
    "url": "assets/js/22.4f2aecac.js",
    "revision": "99b409c535b7a9721da50a4f7e116f9f"
  },
  {
    "url": "assets/js/23.f425d1b8.js",
    "revision": "a9ac67dd3e4dceffd0091a13acf919f3"
  },
  {
    "url": "assets/js/24.0cd1b8f0.js",
    "revision": "bf9204c3843a64864c4560a241a8334f"
  },
  {
    "url": "assets/js/25.80d8eda5.js",
    "revision": "8d59e99df2edb36d0d1d0b5da5e72823"
  },
  {
    "url": "assets/js/26.7f6f78ec.js",
    "revision": "9c4a7f2af2fdc3fa8984908850547661"
  },
  {
    "url": "assets/js/27.3dd05e22.js",
    "revision": "6c610655b57f6b46e266949dce5f45e3"
  },
  {
    "url": "assets/js/28.a0f41712.js",
    "revision": "0a9b53a85cda7059db91983aede64a3a"
  },
  {
    "url": "assets/js/29.705c8702.js",
    "revision": "a3446a926a02ee7c9f75f4cdc1262fd2"
  },
  {
    "url": "assets/js/3.6a5372a7.js",
    "revision": "3fa14d43f48c8e198d97a1d2f1b5c008"
  },
  {
    "url": "assets/js/30.73e3b02b.js",
    "revision": "6c20525623d3597f81dab218bb34435f"
  },
  {
    "url": "assets/js/31.49b171ba.js",
    "revision": "b2fc57d30caa6ef63e3c3f33d55019e2"
  },
  {
    "url": "assets/js/4.dad8f1e2.js",
    "revision": "0897ad44e2b55aa3cacd64107952e8a9"
  },
  {
    "url": "assets/js/5.868ccc2e.js",
    "revision": "735fdf0cb8e24d44e1b1686dd83bb95f"
  },
  {
    "url": "assets/js/6.53bd7877.js",
    "revision": "33aa7f6004ef5306c71059d679de84fd"
  },
  {
    "url": "assets/js/7.d74dec53.js",
    "revision": "8ad92df139bf749cecfeac8d8d6398e3"
  },
  {
    "url": "assets/js/8.f3c5c757.js",
    "revision": "788a4b774a95fbef6197bd61188b19fa"
  },
  {
    "url": "assets/js/9.6a681094.js",
    "revision": "5830095aa209c5cc58c41fdcb26dfe3b"
  },
  {
    "url": "assets/js/app.4c002d4e.js",
    "revision": "59970d4201ffbafa13dd197fab416d6f"
  },
  {
    "url": "assets/js/vendors~docsearch.f68603d6.js",
    "revision": "f93d971a77666c4478303a4c74930957"
  },
  {
    "url": "en/for_web3_user/backup.html",
    "revision": "03a503fbad05babe55b27423dac90d70"
  },
  {
    "url": "en/for_web3_user/gas-and-fees.html",
    "revision": "1c1c4394e39e0f36ceb154130bfc1d32"
  },
  {
    "url": "en/for_web3_user/keyring.html",
    "revision": "a98029485a7155d57f1cf767257f57bd"
  },
  {
    "url": "en/for_web3_user/metamask.html",
    "revision": "7fcc5629e52f5dab1e5a070f63e6e4ec"
  },
  {
    "url": "en/for_web3_user/multisig.html",
    "revision": "583062ba8dc9f2ee7f2638ab02db0a19"
  },
  {
    "url": "en/for_web3_user/sophon-wallet.html",
    "revision": "0ca37bd0abfd6929b2baa5d61ad3ec42"
  },
  {
    "url": "en/for_web3_user/tokens.html",
    "revision": "f1ad20c2e65ad3470f3ffcda7895d5ed"
  },
  {
    "url": "en/for_web3_user/transactions.html",
    "revision": "69eb4ce2289874c68c13826650fea515"
  },
  {
    "url": "en/for_web3_user/wormhole.html",
    "revision": "ee3d534b5da2e3571abab9a67d82b61c"
  },
  {
    "url": "en/index.html",
    "revision": "5d68d7dc6cc67ebc7f75494577138395"
  },
  {
    "url": "en/test12.html",
    "revision": "92c81fdbd826a8268f84ffd07109fed0"
  },
  {
    "url": "en/test13.html",
    "revision": "24fc372f91123aefab91768c567883b0"
  },
  {
    "url": "en/test21.html",
    "revision": "3dfe65e05a360ce479257f449137e1fc"
  },
  {
    "url": "en/test22.html",
    "revision": "da2bfbafb7dc1058a1f4ed0b991d79f6"
  },
  {
    "url": "en/test23.html",
    "revision": "d8ba48ad93134f52652e6644952518d7"
  },
  {
    "url": "zh/for_web3_user/test11.html",
    "revision": "1f0fe8795a790587d39055619f3e92b4"
  },
  {
    "url": "zh/index.html",
    "revision": "27021442c3e8d195f2d76c2ce71a0ebb"
  },
  {
    "url": "zh/test12.html",
    "revision": "5c7b472482c3ccc86cea7ec680e8ab30"
  },
  {
    "url": "zh/test13.html",
    "revision": "0408176c71d6ca6d554ae95a004b3342"
  },
  {
    "url": "zh/test21.html",
    "revision": "29bd69630422276cf7139371fafbf3a9"
  },
  {
    "url": "zh/test22.html",
    "revision": "f4c93e7ebf90733ce1c63e15020f47d1"
  },
  {
    "url": "zh/test23.html",
    "revision": "b10efa0212b9da2120c146e5e9e89958"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
addEventListener('message', event => {
  const replyPort = event.ports[0]
  const message = event.data
  if (replyPort && message && message.type === 'skip-waiting') {
    event.waitUntil(
      self.skipWaiting().then(
        () => replyPort.postMessage({ error: null }),
        error => replyPort.postMessage({ error })
      )
    )
  }
})
