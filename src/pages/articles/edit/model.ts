import { AnyAction } from 'redux';
import { EffectsCommandMap } from 'dva';
import { message } from 'antd';
import { update } from './service';

export interface StateType {}

export type Effect = (
  action: AnyAction,
  effects: EffectsCommandMap & { select: <T>(func: (state: {}) => T) => T },
) => void;

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    submitForm: Effect;
  };
}

function noop() {}

const Model: ModelType = {
  namespace: 'articlesEdit',

  state: {},

  effects: {
    *submitForm({ id, payload, callback = noop }, { call }) {
      yield call(update, id, payload);
      message.success('提交成功');
      callback();
    },
  },
};

export default Model;
