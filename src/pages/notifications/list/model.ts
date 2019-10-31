import { Reducer } from 'redux';
import { Effect } from '@/models/connect';
import { INotification, IMeta } from '@/models/data';
import { queryList } from './service';

export interface StateType {
  list: INotification[];
  pagination: IMeta;
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
  namespace: 'notificationList',
  state: {
    list: [],
    pagination: {},
  },
  effects: {
    * fetch({ payload }, { call, put }) {
      const { data: list, pagination } = yield call(queryList, payload);

      yield put({
        type: 'queryList',
        payload: {
          list,
          pagination,
        },
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
