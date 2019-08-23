import { message } from 'antd';
import { Effect } from '@/models/connect';
import { store } from './service';

export interface StateType {
}

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    submitForm: Effect;
  };
}

const Model: ModelType = {
  namespace: 'articleCreate',

  state: {},

  effects: {
    * submitForm({ payload, callback }, { call }) {
      yield call(store, payload);
      message.success('提交成功');
      if (callback) {
        callback();
      }
    },
  },
};

export default Model;
