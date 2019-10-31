import { Reducer } from 'redux';
import { unionBy, find, findIndex, get } from 'lodash';
import { Effect } from '@/models/connect';
import { IArticle, IComment, IMeta } from '@/models/data';
import * as services from './services';

export interface StateType {
  article: IArticle;
  comments: IComment[];
  meta: IMeta;
}

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    fetchArticle: Effect;
    fetchComments: Effect;
    appendFetchComments: Effect;
    appendFetchChildrenComments: Effect;
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
    meta: {
      current_page: 0,
    },
  },

  effects: {
    * fetchArticle ({ id, payload }, { call, put }) {
      const { data: article } = yield call(services.queryArticle, id, payload);
      yield put({ type: 'setArticle', article });
    },

    * fetchComments ({ article_id, payload }, { call, put }) {
      const { data: comments, meta: meta } = yield call(services.queryArticleComments, article_id, payload);

      yield put({
        type: 'queryComments',
        comments,
        meta,
      });
    },

    * appendFetchComments ({ article_id, payload }, { select, call, put }) {
      const state = yield select(({ articleShow }) => articleShow);

      const { data: comments, meta } = yield call(services.queryArticleComments, article_id, {
        ...payload,
        page: state.meta.current_page + 1,
      });

      yield put({
        type: 'appendComments',
        comments,
        meta,
      });
    },

    * appendFetchChildrenComments ({ article_id, comment_id, payload }, { select, call, put }) {
      const state = yield select(({ articleShow }) => articleShow);

      const comment: IComment = find(state.comments, comment => comment.id === comment_id);

      const { data: comments, meta } = yield call(services.queryArticleComments, article_id, {
        ...payload,
        root_id: comment_id,
        page: get(comment, 'meta.current_page', 0) + 1,
      });

      comment.children = unionBy((comment.children || []).concat(comments), 'id');
      comment.meta = meta;

      yield put({
        type: 'queryComments',
        comments: state.comments,
        meta: state.meta,
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
        state.meta.total++;
      }

      yield put({
        type: 'queryComments',
        comments: state.comments,
        meta: { ...state.meta },
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

    queryComments (state, { comments, meta }) {
      return {
        ...state,
        comments,
        meta: meta,
      } as StateType;
    },

    appendComments (state: any, { comments, meta }) {
      const uniqueComments = unionBy(state.comments.concat(comments), 'id');

      return {
        ...state,
        comments: uniqueComments,
        meta: meta,
      } as StateType;
    },
  },
};

export default Model;
