import { Subscription } from 'dva';
import { Reducer } from 'redux';
import { Effect } from '@/models/connect';
import { queryCurrent, query as queryUsers } from '@/services/user';
import { IUser } from '@/models/data';
import websocket from '@/utils/websocket';

export interface UserModelState {
  currentUser?: IUser;
}

export interface UserModelType {
  namespace: 'user';
  state: UserModelState;
  effects: {
    fetch: Effect;
    fetchCurrent: Effect;
  };
  reducers: {
    saveCurrentUser: Reducer<UserModelState>;
  };
  subscriptions: { setup: Subscription };
}

const UserModel: UserModelType = {
  namespace: 'user',

  state: {
    currentUser: {},
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

        websocket.create();
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

  subscriptions: {
    setup({ history }) {
      history.listen(() => {
        // @ts-ignore
        const { currentUser } = window.g_app._store.getState().user;
        if (
          currentUser &&
          currentUser.name &&
          (websocket.ws && websocket.ws.readyState === 3)
        ) {
          // @ts-ignore
          window.g_app._store.dispatch({ type: 'user/fetchCurrent' });
        }
      });
    },
  },
};

export default UserModel;
