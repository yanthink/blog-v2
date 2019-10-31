import { Reducer } from 'redux';
import { Effect } from '@/models/connect';
import { IArticle, IMeta } from '@/models/data';
import * as services from './services';

export interface StateType {
  list: IArticle[];
  meta: IMeta;
}

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    fetch: Effect;
  };
  reducers: {
    queryList: Reducer<StateType>;
  };
}

const Model: ModelType = {
  namespace: 'articleList',

  state: {
    list: [],
    meta: {
      current_page: 0,
    },
  },

  effects: {
    * fetch ({ payload }, { call, put }) {
      const { data: list, meta } = yield call(services.queryArticles, payload);
      yield put({
        type: 'queryList',
        list,
        meta,
      });
    },
  },

  reducers: {
    queryList (state, { list, meta }) {
      return {
        ...state,
        list,
        meta,
      };
    },
  },
};

export default Model;
