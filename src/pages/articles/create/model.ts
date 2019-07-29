import { AnyAction } from 'redux';
import { EffectsCommandMap } from 'dva';
import { message } from 'antd';
import { store } from './service';

export type Effect = (
  action: AnyAction,
  effects: EffectsCommandMap & { select: <T>(func: (state: {}) => T) => T },
) => void;

export interface ModelType {
  namespace: string;
  state: {};
  effects: {
    submitForm: Effect;
  };
}

function noop() {}

const Model: ModelType = {
  namespace: 'articlesCreate',

  state: {},

  effects: {
    *submitForm({ payload, callback = noop }, { call }) {
      yield call(store, payload);
      message.success('提交成功');
      callback();
    },
  },
};

export default Model;
