import { IConfig, IPlugin } from 'umi-types';
import defaultSettings from './defaultSettings'; // https://umijs.org/config/

import slash from 'slash2';
import webpackPlugin from './plugin.config';
import routerData from './router.config';

const { pwa, primaryColor } = defaultSettings;

const prod = process.env.NODE_ENV === 'production';

const plugins: IPlugin[] = [
  [
    'umi-plugin-react',
    {
      antd: true,
      dva: {
        hmr: true,
      },
      locale: {
        enable: false,
        default: 'zh-CN',
        baseNavigator: false,
      },
      dynamicImport: {
        loadingComponent: './components/PageLoading/index',
        webpackChunkName: true,
        level: 3,
      },
      pwa: pwa
        ? {
          workboxPluginMode: 'InjectManifest',
          workboxOptions: {
            importWorkboxFrom: 'local',
          },
        }
        : false,
    },
  ],
  [
    'umi-plugin-pro-block',
    {
      moveMock: false,
      moveService: false,
      modifyRequest: true,
      autoAddMenu: true,
    },
  ],
];

export default {
  plugins,
  publicPath: '/',
  block: {
    defaultGitUrl: 'https://github.com/ant-design/pro-blocks',
  },
  hash: true,
  targets: {
    ie: 11,
  },
  devtool: !prod ? 'source-map' : false,
  // umi routes: https://umijs.org/zh/guide/router.html
  routes: routerData,
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': primaryColor,
  },
  define: {
    API_URL: '/api/',
    USER_TOKEN_STORAGE_KEY: 'APP_USER_TOKEN',
    AUTHORITY_STORAGE_KEY: 'APP_AUTHORITY',
    SOCKET_ID_STORAGE_KEY: 'SOCKET_ID',
    SOCKET_HOST: !prod ? 'https://api.blog.test' : 'https://www.einsition.com',
    UPLOAD_URL: '/api/attachments/upload',
  },
  ignoreMomentLocale: true,
  lessLoaderOptions: {
    javascriptEnabled: true,
  },
  disableRedirectHoist: true,
  disableCSSModules: false,
  cssLoaderOptions: {
    modules: false,
    getLocalIdent (context: { resourcePath: string }, _: string, localName: string) {
      if (
        context.resourcePath.includes('node_modules') ||
        context.resourcePath.includes('ant.design.pro.less') ||
        context.resourcePath.includes('global.less')
      ) {
        return localName;
      }

      const match = context.resourcePath.match(/src(.*)/);

      if (match && match[1]) {
        const antdProPath = match[1].replace('.less', '');
        const arr = slash(antdProPath)
          .split('/')
          .map((a: string) => a.replace(/([A-Z])/g, '-$1'))
          .map((a: string) => a.toLowerCase());
        return `blog${arr.join('-')}-${localName}`.replace(/--/g, '-');
      }

      return localName;
    },
  },
  manifest: {
    basePath: '/',
  },
  chainWebpack: webpackPlugin,
  treeShaking: true,
  proxy: {
    '/api': {
      target: 'http://api.blog.test',
      changeOrigin: true,
    },
    '/_debugbar': {
      target: 'http://api.blog.test',
      changeOrigin: true,
    },
  },
  extraBabelPlugins: [
    [
      'prismjs',
      {
        languages: [
          'markup',
          'markup-templating',
          'cpp',
          'css',
          'less',
          'scss',
          'clike',
          'javascript',
          'typescript',
          'jsx',
          'tsx',
          'php',
          'java',
          'bash',
          'ini',
          'json',
          'sql',
          'yaml',
        ],
        plugins: [
          'line-numbers',
          'show-language',
          'copy-to-clipboard',
        ],
        theme: 'okaidia',
        css: true,
      },
    ],
  ],
  copy: [
    {
      from: 'node_modules/emoji-assets',
      to: 'emoji-assets',
      toType: 'dir'
    },
    {
      from: 'node_modules/font-awesome',
      to: 'font-awesome',
      toType: 'dir'
    },
  ],
} as IConfig;
