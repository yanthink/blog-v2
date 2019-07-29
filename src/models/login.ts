import { AnyAction } from 'redux';

import { EffectsCommandMap } from 'dva';
import { routerRedux } from 'dva/router';
import { setAuthority, setToken } from '@/utils/authority';
import { reloadAuthorized } from '@/utils/Authorized';

export type Effect = (
  action: AnyAction,
  effects: EffectsCommandMap & { select: <T>(func: (state: {}) => T) => T },
) => void;

export interface ModelType {
  namespace: string;
  state: {};
  effects: {
    logout: Effect;
  };
}

const Model: ModelType = {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    *logout(_, { put }) {
      // @ts-ignore https://umijs.org/zh/guide/with-dva.html#faq
      window.g_app._store.dispatch({
        type: 'user/saveCurrentUser',
        payload: [],
      });

      setToken('');
      setAuthority([]);
      reloadAuthorized();

      // redirect
      if (window.location.pathname !== '/articles/list') {
        yield put(routerRedux.replace('/articles/list'));
      }
    },
  },
};

export default Model;
