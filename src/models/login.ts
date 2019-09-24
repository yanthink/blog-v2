import { routerRedux } from 'dva/router';
import { Effect } from '@/models/connect';
import { setAuthority, setToken } from '@/utils/authority';
import { reloadAuthorized } from '@/utils/Authorized';
import websocket from '@/utils/websocket';

export interface LoginModelType {
  namespace: string;
  state: {};
  effects: {
    logout: Effect;
  };
}

const LoginModel: LoginModelType = {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    * logout(_, { put }) {
      // @ts-ignore https://umijs.org/zh/guide/with-dva.html#faq
      window.g_app._store.dispatch({
        type: 'user/saveCurrentUser',
        payload: [],
      });

      setToken('');
      setAuthority([]);
      reloadAuthorized();

      websocket.close();

      // redirect
      if (window.location.pathname !== '/articles/list') {
        yield put(routerRedux.replace('/articles/list'));
      }
    },
  },
};

export default LoginModel;
