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
        path: '/',
        redirect: '/articles/list',
      },
      {
        name: '文章列表',
        icon: 'read',
        path: 'articles/list',
        component: './articles/list',
      },
      {
        name: '文章详情',
        path: 'articles/:id/show',
        hideInMenu: true,
        component: './articles/show',
      },
      {
        name: '新建文章',
        path: 'articles/create',
        authority: 'articles.store',
        hideInMenu: true,
        component: './articles/create',
      },
      {
        name: '编辑文章',
        path: 'articles/:id/edit',
        authority: 'articles.upload',
        hideInMenu: true,
        component: './articles/edit',
      },
      {
        name: '用户管理',
        icon: 'user',
        path: 'users/list',
        authority: 'users.index',
        component: './users/list',
      },
      {
        name: '在线用户',
        path: 'users/online',
        authority: 'users.index',
        hideInMenu: true,
        component: './users/online',
      },
      {
        name: '系统管理',
        icon: 'setting',
        path: 'system',
        authority: ['notifications.index', 'tags.index', 'roles.index', 'permissions.index'],
        routes: [
          {
            name: '通知管理',
            icon: 'bell',
            path: 'notifications/list',
            authority: 'notifications.index',
            component: './notifications/list',
          },
          {
            name: '标签管理',
            icon: 'tags',
            path: 'tags/list',
            authority: 'tags.index',
            component: './tags/list',
          },
          {
            name: '角色管理',
            icon: 'idcard',
            path: 'roles/list',
            authority: 'roles.index',
            component: './roles/list',
          },
          {
            name: '权限管理',
            icon: 'safety',
            path: 'permissions/list',
            authority: 'permissions.index',
            component: './permissions/list',
          },
          {
            component: './404',
          },
        ],
      },
      {
        name: '账户中心',
        path: 'account',
        hideInMenu: true,
        routes: [
          {
            name: '账户中心',
            path: 'center',
            component: './account/center',
          },
          {
            name: '我的通知',
            path: 'notifications',
            component: './account/notifications',
          },
          {
            name: '个人设置',
            path: 'settings',
            component: './account/settings',
          },
        ],
      },
      {
        name: '403',
        path: 'exception/403',
        hideInMenu: true,
        component: './exception/403',
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
