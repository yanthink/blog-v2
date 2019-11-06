import { Reducer } from 'redux';
import { Effect } from '@/models/connect';
import { IPermission, IMeta } from '@/models/data';
import * as services from './services';

export interface StateType {
  list: IPermission[];
  meta: IMeta;
}

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    fetch: Effect;
    create: Effect;
    update: Effect;
  };
  reducers: {
    queryList: Reducer<StateType>;
  };
}

const Model: ModelType = {
  namespace: 'permissionList',

  state: {
    list: [],
    meta: {},
  },

  effects: {
    * fetch ({ payload }, { call, put }) {
      const { data: list, meta } = yield call(services.queryPermissions, payload);
      yield put({
        type: 'queryList',
        payload: { list, meta },
      });
    },

    * create ({ payload }, { call }) {
      yield call(services.storePermission, payload);
    },

    * update ({ id, payload }, { call }) {
      yield call(services.updatePermission, id, payload);
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
