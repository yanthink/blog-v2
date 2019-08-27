export default [
  {
    path: '/demos',
    component: '../layouts/BlankLayout',
    routes: [
      {
        path: 'yt-simplemde-editor',
        name: 'ytSimplemdeEditor',
        component: './demos/ytSimplemdeEditor',
      },
      {
        path: 'yt-emoji-picker',
        name: 'ytEmojiPicker',
        component: './demos/ytEmojiPicker',
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/tools',
    component: '../layouts/BlankLayout',
    routes: [
      {
        path: 'emoji-cheat-sheet',
        name: 'emojiCheatSheet',
        component: './tools/emojiCheatSheet',
      },
    ],
  },
  {
    path: '/auth',
    component: '../layouts/AuthLayout',
    routes: [
      {
        path: 'login',
        name: '登录',
        component: './auth/login',
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    routes: [
      {
        name: '文章列表',
        icon: 'edit',
        path: '/articles/list',
        component: './articles/list',
      },
      {
        name: '文章详情',
        path: '/articles/:id/show',
        hideInMenu: true,
        component: './articles/show',
      },
      {
        name: '新建文章',
        path: '/articles/create',
        authority: 'articles.store',
        hideInMenu: true,
        component: './articles/create',
      },
      {
        name: '编辑文章',
        path: '/articles/:id/edit',
        authority: 'articles.upload',
        hideInMenu: true,
        component: './articles/edit',
      },
      {
        name: '用户管理',
        icon: 'user',
        path: '/users/list',
        authority: 'users.index',
        component: './users/list',
      },
      {
        name: 'center',
        path: '/account/center',
        hideInMenu: true,
        component: './account/center',
      },
      {
        name: 'notice',
        path: '/account/notice',
        hideInMenu: true,
        component: './account/notice',
      },
      {
        component: './404',
      },
    ],
  },
  {
    component: './404',
  },
];
