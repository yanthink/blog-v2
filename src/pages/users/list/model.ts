import { AnyAction, Reducer } from 'redux';
import { EffectsCommandMap } from 'dva';

import { UserType } from '@/models/user';
import { PaginationType } from './data';
import { queryList } from './service';

export interface StateType {
  list: UserType[];
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
  namespace: 'userList',

  state: {
    list: [],
    pagination: {},
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
