import { notification } from 'antd';
import { get } from 'lodash';
import { getToken } from '@/utils/authority';
import { getSocketUrl } from '@/utils/utils';

/* eslint no-use-before-define:0, @typescript-eslint/no-use-before-define:0 */

interface Heartbeat {
  timeout: number;
  pingTimeout: any;
  reset: () => Heartbeat;
  start: () => void;
}

const heartbeat: Heartbeat = {
  timeout: 240000, // 4分钟
  pingTimeout: null,
  reset() {
    clearTimeout(this.pingTimeout);
    return this;
  },
  start() {
    this.pingTimeout = setTimeout(() => {
      if (websocket.ws && websocket.ws.readyState === 1) {
        websocket.ws.send('ping');
        this.reset().start();
      }
    }, this.timeout);
  },
};


interface IWebSocket {
  ws?: WebSocket;
  create: () => false | WebSocket;
  close: () => void;
}

const websocket: IWebSocket = {
  ws: undefined,
  create() {
    if (this.ws && this.ws.readyState !== 3) {
      return false;
    }

    const token = getToken().split(' ')[1];
    this.ws = new WebSocket(getSocketUrl({ token }));

    heartbeat.reset().start();

    this.ws.addEventListener('message', (e: any) => {
      heartbeat.reset().start();

      const { data: msg } = e;

      // @ts-ignore
      const { currentUser } = window.g_app._store.getState().user;

      const { event, data } = JSON.parse(msg);
      /* eslint no-case-declarations:0 */
      switch (event) {
        case 'Illuminate\\Notifications\\Events\\BroadcastNotificationCreated':
          if (currentUser && currentUser.name) {
            const typeToTitleMap = {
              'App\\Notifications\\CommentArticle': '评论了你的文章',
              'App\\Notifications\\ReplyComment': '回复了你的评论',
              'App\\Notifications\\LikeArticle': '赞了你的文章',
              'App\\Notifications\\LikeComment': '赞了你的评论',
              'App\\Notifications\\LikeReply': '赞了你的回复',
            };

            notification.info({
              message: '你收到一条新通知',
              description: `${get(data, 'form_user_name')} • ${get(typeToTitleMap, data.type as string)}`,
            });

            // @ts-ignore
            window.g_app._store.dispatch({
              type: 'user/saveCurrentUser',
              payload: {
                ...currentUser,
                unread_count: (currentUser.unread_count || 0) - 0 + 1,
              },
            });
          }
          break;
        default:
          break;
      }
    });

    this.ws.addEventListener('close', () => {
      heartbeat.reset();
    });

    return this.ws;
  },
  close() {
    if (this.ws && this.ws.readyState === 1) {
      this.ws.close();
    }
    this.ws = undefined;
  },
};

export default websocket;
