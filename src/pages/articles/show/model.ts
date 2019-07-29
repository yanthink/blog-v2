import { AnyAction, Reducer } from 'redux';
import { EffectsCommandMap } from 'dva';
import { queryArticle } from './service';
import { ArticleType } from '../list/data';

export interface StateType {
  article?: ArticleType;
}

export type Effect = (
  action: AnyAction,
  effects: EffectsCommandMap & { select: <T>(func: (state: {}) => T) => T },
  reducers: {
    show: Reducer<StateType>;
  },
) => void;

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    fetchArticle: Effect;
  };
  reducers: {
    show: Reducer<StateType>;
  };
}

const Model: ModelType = {
  namespace: 'articlesShow',

  state: {
    article: {},
  },

  effects: {
    *fetchArticle({ id, payload }, { call, put }) {
      const { data: article } = yield call(queryArticle, id, payload);
      yield put({
        type: 'show',
        payload: { article },
      });
    },
  },

  reducers: {
    show(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};

export default Model;
