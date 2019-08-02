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
        name: 'login',
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
        name: 'articles.list',
        icon: 'edit',
        path: '/articles/list',
        component: './articles/list',
      },
      {
        name: 'articles.show',
        path: '/articles/:id/show',
        hideInMenu: true,
        component: './articles/show',
      },
      {
        name: 'articles.create',
        path: '/articles/create',
        authority: 'articles.store',
        hideInMenu: true,
        component: './articles/create',
      },
      {
        name: 'articles.edit',
        path: '/articles/:id/edit',
        authority: 'articles.upload',
        hideInMenu: true,
        component: './articles/edit',
      },
      {
        name: 'user.list',
        icon: 'user',
        path: '/users/list',
        authority: 'users.index',
        component: './users/list',
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
