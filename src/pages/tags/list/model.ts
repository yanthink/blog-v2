import { Reducer } from 'redux';
import { message } from 'antd';
import { Effect } from '@/models/connect';
import { ITag, IMeta } from '@/models/data';
import { queryList, store, update } from './service';

export interface StateType {
  list: ITag[];
  pagination: IMeta;
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
    * create({ payload, callback }, { call }) {
      yield call(store, payload);
      message.success('添加成功！');
      if (callback) {
        callback();
      }
    },
    * update({ id, payload, callback }, { call }) {
      yield call(update, id, payload);
      message.success('修改成功！');
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
