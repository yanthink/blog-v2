import { Reducer } from 'redux';
import { Effect } from '@/models/connect';
import { IArticle, IComment, IMeta } from '@/models/data';
import * as services from './services';

export interface StateType {
  favorites: {
    list: IArticle[];
    meta: IMeta;
  };

  comments: {
    list: IComment[];
    meta: IMeta;
  };

  likers: {
    list: IComment[];
    meta: IMeta;
  };
}

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    fetchFavorites: Effect;
    fetchComments: Effect;
    fetchLikers: Effect;
  };
  reducers: {
    queryFavorites: Reducer<StateType>;
    queryComments: Reducer<StateType>;
    queryLikers: Reducer<StateType>;
  };
}

const Model: ModelType = {
  namespace: 'accountCenter',

  state: {
    favorites: {
      list: [],
      meta: {},
    },

    comments: {
      list: [],
      meta: {},
    },

    likers: {
      list: [],
      meta: {},
    },
  },

  effects: {
    * fetchFavorites ({ payload }, { call, put }) {
      const { data: list, meta } = yield call(services.queryFollowRelations, {
        ...payload,
        relation: 'favorite',
      });

      yield put({
        type: 'queryFavorites',
        payload: {
          list,
          meta,
        },
      });
    },

    * fetchComments ({ payload }, { call, put }) {
      const { data: list, meta } = yield call(services.queryComments, payload);

      yield put({
        type: 'queryComments',
        payload: {
          list,
          meta,
        },
      });
    },

    * fetchLikers ({ payload }, { call, put }) {
      const { data: list, meta } = yield call(services.queryFollowRelations, {
        ...payload,
        relation: ['like', 'upvote'],
      });

      yield put({
        type: 'queryLikers',
        payload: {
          list,
          meta,
        },
      });
    },
  },

  reducers: {
    queryFavorites (state, action) {
      return {
        ...state,
        favorites: action.payload,
      } as StateType;
    },

    queryComments (state, action) {
      return {
        ...state,
        comments: action.payload,
      } as StateType;
    },

    queryLikers (state, action) {
      return {
        ...state,
        likers: action.payload,
      } as StateType;
    }
  },
};

export default Model;
