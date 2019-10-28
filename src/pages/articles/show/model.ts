import { Reducer } from 'redux';
import { unionBy, find, findIndex } from 'lodash';
import { Effect } from '@/models/connect';
import { IArticle, IComment, IPagination } from '@/models/data';
import * as services from './services';

export interface StateType {
  article: IArticle;
  comments: IComment[];
  pagination: IPagination;
}

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    fetchArticle: Effect;
    fetchComments: Effect;
    appendFetchComments: Effect;
    submitComment: Effect;
  };
  reducers: {
    setArticle: Reducer<StateType>;
    queryComments: Reducer<StateType>;
    appendComments: Reducer<StateType>;
  };
}

const Model: ModelType = {
  namespace: 'articleShow',

  state: {
    article: {},
    comments: [],
    pagination: {
      current_page: 0,
    },
  },

  effects: {
    * fetchArticle ({ id, payload }, { call, put }) {
      const { data: article } = yield call(services.queryArticle, id, payload);
      yield put({ type: 'setArticle', article });
    },

    * fetchComments ({ article_id, payload }, { call, put }) {
      const { data: comments, meta: pagination } = yield call(services.queryArticleComments, article_id, payload);

      yield put({
        type: 'queryComments',
        comments,
        pagination,
      });
    },

    * appendFetchComments ({ article_id, payload }, { select, call, put }) {
      const state = yield select(({ articleShow }) => articleShow);

      const { data: comments, meta: pagination } = yield call(services.queryArticleComments, article_id, {
        ...payload,
        page: state.pagination.current_page + 1,
      });

      yield put({
        type: 'appendComments',
        comments,
        pagination,
      });
    },

    * submitComment ({ article_id, payload, callback }, { select, call, put }) {
      const { data } = yield call(services.postArticleComment, article_id, payload);

      const state = yield select(({ articleShow }) => articleShow);

      if (data.parent_id && data.root_id) {
        const comment = find(state.comments, comment => comment.id === data.root_id);
        comment.cache.comments_count++;
        const index = findIndex(comment.children, (comment: IComment) => comment.id === data.parent_id);
        comment.children.splice(index + 1, 0, data);
      } else {
        state.comments.unshift(data);
        state.pagination.total++;
      }

      yield put({
        type: 'queryComments',
        comments: state.comments,
        pagination: { ...state.pagination },
      });

      state.article.cache.comments_count++;
      yield put({ type: 'setArticle', article: { ...state.article } });

      if (callback) {
        callback();
      }
    },
  },

  reducers: {
    setArticle (state, { article }) {
      return {
        ...state,
        article,
      } as StateType;
    },

    queryComments (state, { comments, pagination }) {
      return {
        ...state,
        comments,
        pagination,
      } as StateType;
    },

    appendComments (state: any, { comments, pagination }) {
      const uniqueComments = unionBy(state.comments.concat(comments), 'id');

      return {
        ...state,
        comments: uniqueComments,
        pagination,
      } as StateType;
    },
  },
};

export default Model;
