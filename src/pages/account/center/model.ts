import { Reducer } from 'redux';
import { Effect } from '@/models/connect';
import { IFavorite, IComment, IReply, ILike, IMeta } from '@/models/data';
import { queryFavorites, queryComments, queryReplys, queryLikes } from './service'

export interface StateType {
  favorites: {
    list: IFavorite[];
    pagination: IMeta;
  };
  comments: {
    list: IComment[];
    pagination: IMeta;
  };
  replys: {
    list: IReply[];
    pagination: IMeta;
  };
  likes: {
    list: ILike[];
    pagination: IMeta;
  };
}

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    fetchFavorites: Effect;
    fetchComments: Effect;
    fetchReplys: Effect;
    fetchLikes: Effect;
  };
  reducers: {
    queryFavorites: Reducer<StateType>;
    queryComments: Reducer<StateType>;
    queryReplys: Reducer<StateType>;
    queryLikes: Reducer<StateType>;
  };
}

const Model: ModelType = {
  namespace: 'accountCenter',

  state: {
    favorites: {
      list: [],
      pagination: {},
    },
    comments: {
      list: [],
      pagination: {},
    },
    replys: {
      list: [],
      pagination: {},
    },
    likes: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    * fetchFavorites({ payload }, { call, put }) {
      const { data: list, pagination } = yield call(queryFavorites, payload);

      yield put({
        type: 'queryFavorites',
        payload: {
          list,
          pagination,
        },
      });
    },
    * fetchComments({ payload }, { call, put }) {
      const { data: list, pagination } = yield call(queryComments, payload);

      yield put({
        type: 'queryComments',
        payload: {
          list,
          pagination,
        },
      });
    },
    * fetchReplys({ payload }, { call, put }) {
      const { data: list, pagination } = yield call(queryReplys, payload);

      yield put({
        type: 'queryReplys',
        payload: {
          list,
          pagination,
        },
      });
    },
    * fetchLikes({ payload }, { call, put }) {
      const { data: list, pagination } = yield call(queryLikes, payload);

      yield put({
        type: 'queryLikes',
        payload: {
          list,
          pagination,
        },
      });
    },
  },

  reducers: {
    queryFavorites(state, action) {
      return {
        ...state,
        favorites: action.payload,
      } as StateType;
    },
    queryComments(state, action) {
      return {
        ...state,
        comments: action.payload,
      } as StateType;
    },
    queryReplys(state, action) {
      return {
        ...state,
        replys: action.payload,
      } as StateType;
    },
    queryLikes(state, action) {
      return {
        ...state,
        likes: action.payload,
      } as StateType;
    },
  },
};

export default Model;
