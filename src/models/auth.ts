import { Effect, Reducer, history } from 'umi';
import { setToken, setAuthority, getToken } from '@/utils/authority';
import { reloadAuthorized } from '@/utils/Authorized';
import { getPageQuery } from '@/utils/utils';
import { IUser } from '@/models/I';
import * as services from '@/services';
import createWebSocket from '@/websocket';

export interface StateType {
  user: IUser;
  logged: boolean;
  unread_count: number;
}

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    attemptLogin: Effect;
    loginSuccess: Effect;
    loadUser: Effect;
    logout: Effect;
  };
  reducers: {
    setUser: Reducer<StateType>;
    setUnreadCount: Reducer<StateType>;
  };
}

const Model: ModelType = {
  namespace: 'auth',

  state: {
    user: {},
    logged: false,
    unread_count: 0,
  },

  effects: {
    *attemptLogin({ payload }, { call, put }) {
      const { data } = yield call(services.login, payload);
      const { access_token, permissions } = data;
      yield put({
        type: 'loginSuccess',
        token: access_token,
        permissions,
      });
    },
    // eslint-disable-next-line require-yield
    *loginSuccess({ token, permissions, callback }) {
      setToken(token);
      setAuthority(permissions);
      reloadAuthorized();

      if (callback) {
        callback();
      }

      const urlParams = new URL(window.location.href);

      const params = getPageQuery();
      let { redirect } = params as { redirect: string };
      if (redirect) {
        const redirectUrlParams = new URL(redirect);
        if (redirectUrlParams.origin === urlParams.origin) {
          redirect = redirect.substr(urlParams.origin.length);
          if (redirect.match(/^\/#/)) {
            redirect = redirect.substr(redirect.indexOf('#') + 1);
          }
        } else {
          window.location.href = redirect;
          return;
        }
      }

      history.replace(redirect || '/');
    },
    *loadUser(_, { call, put }) {
      if (getToken()) {
        const { data } = yield call(services.loadUserData);
        yield put({ type: 'setUser', user: data });
      }
    },
    *logout(_, { put }) {
      setToken('');
      setAuthority([]);
      reloadAuthorized();

      yield put({ type: 'setUser', user: {} });
    },
  },

  reducers: {
    setUser(state, { user }) {
      const newState = {
        ...state,
        logged: !!user.id,
        user,
        unread_count: user.cache ? user.cache.unread_count : 0,
      } as StateType;

      createWebSocket(newState);

      return newState;
    },

    setUnreadCount(state, { unread_count }) {
      return {
        ...state,
        unread_count,
      } as StateType;
    },
  },
};

export default Model;
