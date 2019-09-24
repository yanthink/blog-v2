import { Reducer } from 'redux';
import { Effect } from '@/models/connect';
import { IUserOnline, IPagination } from '@/models/data';
import { queryOnline } from './service';

export interface StateType {
  list: IUserOnline[];
  pagination: IPagination;
}

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    fetch: Effect;
  };
  reducers: {
    queryOnline: Reducer<StateType>;
  };
}

const Model: ModelType = {
  namespace: 'userOnline',

  state: {
    list: [],
    pagination: {},
  },

  effects: {
    * fetch({ payload }, { call, put }) {
      const { data: list, pagination } = yield call(queryOnline, payload);
      yield put({
        type: 'queryOnline',
        payload: { list, pagination },
      });
    },
  },

  reducers: {
    queryOnline(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};

export default Model;
