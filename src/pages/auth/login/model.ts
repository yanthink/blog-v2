import { routerRedux } from 'dva/router';
import { Effect } from '@/models/connect';
import { setToken, setAuthority } from '@/utils/authority';
import { reloadAuthorized } from '@/utils/Authorized';
import { login } from './service';
import { getPageQuery } from './utils';

export interface StateType {
}

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    login: Effect;
    loginSuccess: Effect;
  };
}

const Model: ModelType = {
  namespace: 'authLogin',

  state: {},

  effects: {
    * login({ payload }, { call, put }) {
      const { data } = yield call(login, payload);
      const { token, permissions } = data;
      yield put({
        type: 'loginSuccess',
        payload: { token, permissions },
      })
    },
    * loginSuccess({ payload: { token, permissions }, callback }, { put }) {
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

      yield put(routerRedux.replace(redirect || '/'));
    },
  },
};

export default Model;
