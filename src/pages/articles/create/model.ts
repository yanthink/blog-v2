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
  namespace: 'articleCreate',

  state: {},

  effects: {
    * submitForm ({ payload }, { call }) {
      yield call(services.storeArticle, payload);
    },
  },
};

export default Model;
