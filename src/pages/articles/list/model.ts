import { Reducer } from 'redux';
import { Effect } from '@/models/connect';
import { IArticle, IPagination } from '@/models/data';
import * as services from './services';

export interface StateType {
  list: IArticle[];
  pagination: IPagination;
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
    pagination: {
      current_page: 0,
    },
  },

  effects: {
    * fetch ({ payload }, { call, put }) {
      const { data: list, meta: pagination } = yield call(services.queryArticles, payload);
      yield put({
        type: 'queryList',
        list,
        pagination,
      });
    },
  },

  reducers: {
    queryList (state, { list, pagination }) {
      return {
        ...state,
        list,
        pagination,
      };
    },
  },
};

export default Model;
