import { Effect } from 'dva';
import { Reducer } from 'redux';

import { queryCurrent, query as queryUsers } from '@/services/user';

export interface UserType {
  id?: number;
  name?: string;
  email?: string;
  user_info?: {
    city?: string;
    gender?: number;
    country?: string;
    language?: string;
    nickName?: string;
    province?: string;
    avatarUrl?: string;
  };
  created_at?: string;
  updated_at?: string;
  unreadCount?: number;
}

export interface UserModelState {
  currentUser?: UserType;
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
    changeNotifyCount: Reducer<UserModelState>;
  };
}

const UserModel: UserModelType = {
  namespace: 'user',

  state: {
    currentUser: {},
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchCurrent(_, { call, put }) {
      const { data: user } = yield call(queryCurrent);
      if (user && user.name) {
        yield put({
          type: 'saveCurrentUser',
          payload: user,
        });
      } else {
        // @ts-ignore https://umijs.org/zh/guide/with-dva.html#faq
        window.g_app._store.dispatch({ type: 'login/logout' });
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
    changeNotifyCount(
      state = {
        currentUser: {},
      },
      action,
    ) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload.totalCount,
          unreadCount: action.payload.unreadCount,
        },
      };
    },
  },
};

export default UserModel;
