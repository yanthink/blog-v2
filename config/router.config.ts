export default [
  {
    path: 'tools',
    component: '../layouts/BlankLayout',
    routes: [
      {
        path: 'emoji-cheat-sheet',
        redirect: '/tools/emojicheatsheet',
      },
      {
        path: 'emojicheatsheet',
        name: 'emojicheatsheet',
        component: './tools/emojicheatsheet',
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
    component: '../layouts/SecurityLayout',
    routes: [
      {
        path: '/',
        component: '../layouts/BasicLayout',
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
            name: '文章详情',
            path: 'articles/:id',
            hideInMenu: true,
            component: './articles/show',
          },
          {
            name: '用户管理',
            icon: 'user',
            path: 'users/list',
            authority: 'users.index',
            component: './users/list',
          },
          {
            name: '系统管理',
            icon: 'setting',
            path: 'system',
            authority: ['comments.index', 'tags.index', 'roles.index', 'permissions.index'],
            routes: [
              {
                name: '评论管理',
                icon: 'message',
                path: 'comments/list',
                authority: 'comments.index',
                component: './comments/list',
              },
              {
                name: '敏感词语',
                icon: 'security-scan',
                path: 'sensitivewords',
                authority: 'comments.update',
                component: './sensitivewords',
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
          // demos
          {
            path: 'demos',
            component: '../layouts/BlankLayout',
            routes: [
              {
                path: 'yt-emoji-picker',
                redirect: '/demos/emojipicker',
              },
              {
                path: 'yt-simplemde-editor',
                redirect: '/demos/simplemdeeditor',
              },
              {
                path: 'emojipicker',
                name: 'emojipicker',
                hideInMenu: true,
                component: './demos/emojipicker',
              },
              {
                path: 'simplemdeeditor',
                name: 'simplemdeeditor',
                hideInMenu: true,
                component: './demos/simplemdeeditor',
              },
            ],
          },
          {
            component: './404',
          },
        ],
      },
    ],
  },
];
