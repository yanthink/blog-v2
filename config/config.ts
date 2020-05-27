import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings'; // https://umijs.org/config/
import proxy from './proxy';
import routerData from './router.config';
import webpackPlugin from './plugin.config';

const { REACT_APP_ENV } = process.env;
const prod = process.env.NODE_ENV === 'production';

export default defineConfig({
  hash: true,
  // @umijs/preset-react
  antd: {
    // https://umijs.org/plugins/plugin-antd
    dark: false,
  },
  dva: {
    // https://umijs.org/plugins/plugin-dva
    hmr: true,
  },
  locale: {
    default: 'zh-CN',
    antd: true,
    title: false,
    baseNavigator: false,
    baseSeparator: '-',
  },
  dynamicImport: {
    loading: '@/components/PageLoading/index',
  },
  request: {
    // https://umijs.org/plugins/plugin-request
    dataField: 'data',
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/zh/guide/router.html
  routes: routerData,
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    // ...darkTheme,
    'primary-color': defaultSettings.primaryColor,
  },
  // @ts-ignore
  title: false,
  define: {
    SOCKET_HOST: !prod ? 'http://api.blog.test' : 'https://www.einsition.com',
    UPLOAD_URL: '/api/attachments/upload',
  },
  ignoreMomentLocale: true,
  manifest: {
    basePath: '/',
  },
  proxy: proxy[REACT_APP_ENV || 'dev'],
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
        plugins: ['line-numbers', 'show-language', 'copy-to-clipboard'],
        theme: 'okaidia',
        css: true,
      },
    ],
  ],
  // https://umijs.org/zh-CN/guide/boost-compile-speed
  nodeModulesTransform: {
    type: prod ? 'all' : 'none',
    exclude: [],
  },
  chainWebpack: webpackPlugin,
  devtool: !prod ? 'source-map' : false,
});
