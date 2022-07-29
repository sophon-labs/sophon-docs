module.exports = (_ctx) => ({
  sourceDir: 'docs',
  dest: 'docs/dist',
  port: 9090,
  base: '/sophon-docs/',
  configureWebpack: {
    resolve: {
      alias: {
        '@static': 'docs/static'
      }
    }
  },

  locales: {
    '/en/': {
      lang: 'en-US',
      title: 'Sophon Docs',
      description: 'Developer documentation for the Sophon',
    },
    '/zh/': {
      lang: 'zh-CN',
      title: 'Sophon 文档',
      description: 'Sophon 开发者文档',
    },
  },

  head: [
    ['link', { rel: 'icon', href: `/favicon.ico` }],
    ['link', { rel: 'manifest', href: '/manifest.json' }],
    ['meta', { name: 'theme-color', content: '#732ad2' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    [
      'meta',
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black' },
    ],
    [
      'link',
      { rel: 'apple-touch-icon', href: `/icons/apple-touch-icon-152x152.png` },
    ],
    [
      'link',
      {
        rel: 'mask-icon',
        href: '/icons/safari-pinned-tab.svg',
        color: '#732ad2',
      },
    ],
    [
      'meta',
      {
        name: 'msapplication-TileImage',
        content: '/icons/msapplication-icon-144x144.png',
      },
    ],
    ['meta', { name: 'msapplication-TileColor', content: '#000000' }],
  ],

  theme: '@vuepress/theme-default',

  themeConfig: {
    repo: 'sophon-labs/sophon-docs',
    docsDir: 'packages/docs/dist',
    editLinks: true,
    logo: '/favicon.ico',
    smoothScroll: true,
    algolia: {
      apiKey: process.env.ALGOLIA_API_KEY,
      indexName: process.env.ALGOLIA_INDEX_NAME,
    },
    locales: {
      '/en/': {
        selectText: 'Languages',
        label: 'English',
        ariaLabel: 'Languages',
        editLinkText: 'Edit this page on GitHub',
        serviceWorker: {
          updatePopup: {
            message: 'New content is available.',
            buttonText: 'Refresh',
          },
        },
      },
      '/zh/': {
        selectText: '选择语言',
        label: '简体中文',
        editLinkText: '在 GitHub 上编辑此页',
        serviceWorker: {
          updatePopup: {
            message: '发现新内容可用.',
            buttonText: '刷新',
          },
        },
      },
    },
    sidebar: {
      '/en/': getGuideSidebar('ABOUT SOPHON', 'For Web3 User', 'For Web3 Developer', 'For Validator&Delegators'),
      '/zh/': getGuideSidebar('介绍', '测试1', '测试2', '测试3'),
    },
  },

  plugins: [
    ['@vuepress/back-to-top', true],
    [
      '@vuepress/pwa',
      {
        serviceWorker: true,
        updatePopup: true,
      },
    ],
    ['@vuepress/medium-zoom', true],
    [
      'container',
      {
        type: 'vue',
        before: '<pre class="vue-container"><code>',
        after: '</code></pre>',
      },
    ],
    [
      'container',
      {
        type: 'upgrade',
        before: (info) => `<UpgradePath title="${info}">`,
        after: '</UpgradePath>',
      },
    ],
    [
      'vuepress-plugin-redirect',
      {
        redirectors: [
          {
            base: '/',
            alternative: '/en/',
          },
        ],
      },
    ],
  ],


  // extraWatchFiles: ['.vuepress/nav/en.js', '.vuepress/nav/zh.js'],
});

function getGuideSidebar(guide, test1, test2, test3) {
  return [
    {
      title: guide,
      collapsable: false,
      children: [''],
    },
    {
      title: test1,
      collapsable: false,
      children: [{
        title: 'Basic Concepts',
        collapsable: true,
        children: ["for_web3_user/transactions.md", "for_web3_user/tokens.md", "for_web3_user/gas-and-fees.md"],
      },
        {
          title: 'Digital Wallets',
          collapsable: true,
          children: ["for_web3_user/metamask.md", "for_web3_user/sophon-wallet.md"],
        },
        {
          title: 'Account Keys',
          collapsable: true,
          children: ["for_web3_user/keyring.md", "for_web3_user/multisig.md"],
        },
        {
          title: 'Tool',
          collapsable: true,
          children: ["for_web3_user/wormhole.md"],
        }
      ],
    },
    {
      title: test2,
      collapsable: false,
      children: ['test21', 'test22', 'test23'],
    },
    {
      title: test3,
      collapsable: false,
      children: ['test21', 'test22', 'test23'],
    }
  ];
}

// function getGuideSidebar(guide, api, bestPractices, mobile, resources) {
//   return [
//     {
//       title: guide,
//       collapsable: false,
//       children: [
//         '',
//         'getting-started',
//         'common-terms',
//         'initializing-dapps',
//         'accessing-accounts',
//         'sending-transactions',
//       ],
//     },
//     {
//       title: api,
//       collapsable: false,
//       children: [
//         'ethereum-provider',
//         'provider-migration',
//         'rpc-api',
//         'signing-data',
//       ],
//     },
//     {
//       title: bestPractices,
//       collapsable: false,
//       children: [
//         'registering-function-names',
//         'registering-your-token',
//         'defining-your-icon',
//         'onboarding-library',
//         'metamask-extension-provider',
//       ],
//     },
//     {
//       title: mobile,
//       collapsable: false,
//       children: [
//         'mobile-getting-started',
//         'site-compatibility-checklist',
//         'mobile-best-practices',
//       ],
//     },
//     {
//       title: resources,
//       collapsable: false,
//       children: ['create-dapp', 'contributors'],
//     },
//   ];
// }
