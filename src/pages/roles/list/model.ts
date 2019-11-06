import { Reducer } from 'redux';
import { Effect } from '@/models/connect';
import { IRole, IMeta } from '@/models/data';
import * as services from './services';

export interface StateType {
  list: IRole[];
  meta: IMeta;
}

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    fetch: Effect;
    create: Effect;
    update: Effect;
    assignPermissions: Effect;
  };
  reducers: {
    queryList: Reducer<StateType>;
  };
}

const Model: ModelType = {
  namespace: 'roleList',

  state: {
    list: [],
    meta: {},
  },

  effects: {
    * fetch ({ payload }, { call, put }) {
      const { data: list, meta } = yield call(services.queryRoles, payload);
      yield put({
        type: 'queryList',
        payload: { list, meta },
      });
    },

    * create ({ payload }, { call }) {
      yield call(services.storeRole, payload);
    },

    * update ({ id, payload }, { call }) {
      yield call(services.updateRole, id, payload);
    },

    * assignPermissions ({ role_id, payload }, { call }) {
      yield call(services.assignPermissions, role_id, payload);
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
