import { Reducer } from 'redux';
import { Effect } from '@/models/connect';
import { ITag, IMeta } from '@/models/data';
import * as services from './services';

export interface StateType {
  list: ITag[];
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
  namespace: 'tagList',

  state: {
    list: [],
    meta: {},
  },

  effects: {
    * fetch ({ payload }, { call, put }) {
      const { data: list, meta } = yield call(services.queryTags, payload);
      yield put({
        type: 'queryList',
        payload: { list, meta },
      });
    },
    * create ({ payload }, { call }) {
      yield call(services.storeTag, payload);
    },
    * update ({ id, payload }, { call }) {
      yield call(services.updateTag, id, payload);
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
