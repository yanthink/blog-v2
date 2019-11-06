import { Reducer } from 'redux';
import { Effect } from '@/models/connect';
import { IUser, IMeta } from '@/models/data';
import * as services from './services';

export interface StateType {
  list: IUser[];
  meta: IMeta;
}

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    fetch: Effect;
    assignPermissions: Effect;
    assignRoles: Effect;
  };
  reducers: {
    queryList: Reducer<StateType>;
  };
}

const Model: ModelType = {
  namespace: 'userList',

  state: {
    list: [],
    meta: {},
  },

  effects: {
    * fetch ({ payload }, { call, put }) {
      const { data: list, meta } = yield call(services.queryUsers, payload);
      yield put({
        type: 'queryList',
        payload: { list, meta },
      });
    },

    * assignPermissions ({ user_id, payload }, { call }) {
      yield call(services.assignPermissions, user_id, payload);
    },

    * assignRoles ({ user_id, payload }, { call }) {
      yield call(services.assignRoles, user_id, payload);
    },
  },

  reducers: {
    queryList (state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};

export default Model;
