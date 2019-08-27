import { Effect } from 'dva';
import { Reducer } from 'redux';
import { notification } from 'antd';
import { get } from 'lodash';
import { queryCurrent, query as queryUsers } from '@/services/user';
import { IUser } from '@/models/data';
import { getToken } from '@/utils/authority';

export interface UserModelState {
  currentUser?: IUser;
}

export interface UserModelType {
  namespace: 'user';
  state: UserModelState;
  ws?: WebSocket;
  createWebSocket: () => void;
  effects: {
    fetch: Effect;
    fetchCurrent: Effect;
  };
  reducers: {
    saveCurrentUser: Reducer<UserModelState>;
  };
}

const UserModel: UserModelType = {
  namespace: 'user',

  state: {
    currentUser: {},
  },

  ws: undefined,

  createWebSocket() {
    if (this.ws && this.ws.readyState === 1) {
      this.ws.close();
    }

    const token = getToken().split(' ')[1];
    const socketUrl = `wss://${window.location.host}/wss?token=${token}`;
    this.ws = new WebSocket(socketUrl);

    this.ws.addEventListener('message', (e: any) => {
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
  },

  effects: {
    * fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    * fetchCurrent(_, { call, put }) {
      const { data: user } = yield call(queryCurrent);
      if (user && user.name) {
        yield put({
          type: 'saveCurrentUser',
          payload: user,
        });

        UserModel.createWebSocket();
      }
    },
  },

  reducers: {
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },
  },
};

export default UserModel;
