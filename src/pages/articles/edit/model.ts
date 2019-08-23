import { message } from 'antd';
import { Effect } from '@/models/connect';
import { update } from './service';

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
  namespace: 'articleEdit',

  state: {},

  effects: {
    * submitForm({ id, payload, callback }, { call }) {
      yield call(update, id, payload);
      message.success('提交成功');
      if (callback) {
        callback();
      }
    },
  },
};

export default Model;
