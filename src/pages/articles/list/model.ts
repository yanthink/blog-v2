import { AnyAction, Reducer } from 'redux';

import { EffectsCommandMap } from 'dva';
import { ArticleType, PaginationType } from './data.d';
import { queryList } from './service';

export interface StateType {
  list: ArticleType[];
  pagination: Partial<PaginationType>;
}

export type Effect = (
  action: AnyAction,
  effects: EffectsCommandMap & { select: <T>(func: (state: StateType) => T) => T },
) => void;

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
  namespace: 'articlesList',

  state: {
    list: [],
    pagination: {
      current: 1,
      pageSize: 10,
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
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
