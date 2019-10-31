import { Reducer } from 'redux';
import { message } from 'antd';
import { Effect } from '@/models/connect';
import { IUser, IMeta } from '@/models/data';
import { queryList, assignPermissions, assignRoles } from './service';

export interface StateType {
  list: IUser[];
  pagination: IMeta;
}

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    fetch: Effect;
    assignPermissions: Effect;
    assignRoles: Effect;
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
    * fetch({ payload }, { call, put }) {
      const { data: list, pagination } = yield call(queryList, payload);
      yield put({
        type: 'queryList',
        payload: { list, pagination },
      });
    },
    * assignPermissions({ userId, payload, callback }, { call }) {
      yield call(assignPermissions, userId, payload);
      message.success('分配成功！');
      if (callback) {
        callback();
      }
    },
    * assignRoles({ userId, payload, callback }, { call }) {
      yield call(assignRoles, userId, payload);
      message.success('分配成功！');
      if (callback) {
        callback();
      }
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
