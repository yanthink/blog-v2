import { Effect } from '@/models/connect';
import * as services from './services';

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
    * submitForm ({ id, payload }, { call }) {
      yield call(services.updateArticle, id, payload);
    },
  },
};

export default Model;
