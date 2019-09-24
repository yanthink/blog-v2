## 项目概述

- 产品名称：个人博客系统前端
- 项目代号：blog-v2
- 演示地址：https://www.einsition.com
- api 项目地址：https://github.com/yanthink/blog-api

该系统使用 ANT DESIGN PROv4.0 编写而成。

## 功能如下

- 文章列表 -- 支持搜索；
- 文章详情 -- 支持代码高亮、emoji 表情，支持评论、回复、收藏、点赞；
- 用户认证 -- 登录、退出，支持小程序扫码登录绑定；
- 权限控制 -- 权限控制菜单和内容；
- 文章管理 -- 列表、详情、发布、修改。集成 SimpleMDE 编辑器，支持粘贴、拖拽上传附件和 emoji 表情；
- 用户管理 -- 列表、添加、修改、分配角色权限；
- 在线用户 -- 实时查看在线用户数据；
- 通知管理 -- websocket 接收通知消息；
- 个人设置 -- 用户名、密码、头像修改，邮箱验证；
- debugbar;

## 开发环境部署/安装

本项目代码使用 React 框架 [ANT DESIGN PRO](https://pro.ant.design/index-cn) 开发。

# 基础安装

#### 1. 克隆源代码

克隆 `blog` 源代码到本地：

    > git clone https://github.com/yanthink/blog-v2.git

#### 2. 安装扩展包依赖

```shell
$ npm install
```

你可以根据情况修改 `config/config.ts` 文件里的内容，如代理设置等：

```
proxy: {
  '/api': {
    target: 'http://api.blog.test/',
    changeOrigin: true,
  },
  '/_debugbar': {
    target: 'http://api.blog.test/',
    changeOrigin: true,
  },
},
```

#### Usage

```shell
$ npm start # visit http://localhost:8000
```
