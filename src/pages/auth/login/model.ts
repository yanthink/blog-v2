import { AnyAction } from 'redux';
import { EffectsCommandMap } from 'dva';
import { routerRedux } from 'dva/router';
import { login } from './service';
import { getPageQuery } from './utils/utils';
import { setToken, setAuthority } from '@/utils/authority';
import { reloadAuthorized } from '@/utils/Authorized';

export interface StateType {}

export type Effect = (
  action: AnyAction,
  effects: EffectsCommandMap & { select: <T>(func: (state: StateType) => T) => T },
) => void;

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    login: Effect;
  };
}

const Model: ModelType = {
  namespace: 'authLogin',

  state: {},

  effects: {
    *login({ payload }, { call, put }) {
      const { data } = yield call(login, payload);
      const { permissions, token } = data;

      setToken(token);
      setAuthority(permissions);
      reloadAuthorized();

      const urlParams = new URL(window.location.href);

      const params = getPageQuery();
      let { redirect } = params as { redirect: string };
      if (redirect) {
        const redirectUrlParams = new URL(redirect);
        if (redirectUrlParams.origin === urlParams.origin) {
          redirect = redirect.substr(urlParams.origin.length);
          if (redirect.match(/^\/.*#/)) {
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
