import { Reducer } from 'redux';
import { Effect } from '@/models/connect';
import { IArticle, IPagination } from '@/models/data';
import { queryList } from './service';

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
      current: 1,
      pageSize: 10,
    },
  },

  effects: {
    * fetch({ payload }, { call, put }) {
      const { data: list, pagination } = yield call(queryList, payload);
      yield put({
        type: 'queryList',
        payload: { list, pagination },
      });
    },
  },

  reducers: {
    queryList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};

export default Model;
