import { AnyAction, Reducer } from 'redux';
import { EffectsCommandMap } from 'dva';
import { message } from 'antd';
import { differenceWith, find, findIndex } from 'lodash';
import { queryArticle, queryComments, queryReplys, commentLike, replyLike, postComment, postReply } from './service';
import { ArticleType, PaginationType } from '../list/data';
import { CommentType, ReplyType } from './data';

export interface StateType {
  article?: ArticleType;
  comments?: CommentType[];
  commentsPagination: Partial<PaginationType>;
}

export type Effect = (
  action: AnyAction,
  effects: EffectsCommandMap & {
    select: <T>(func: (state: { articlesShow: StateType }) => T) => T,
  },
  reducers: {
    save: Reducer<StateType>;
  },
) => void;

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    fetchArticle: Effect;
    fetchComments: Effect;
    appendFetchComments: Effect;
    appendFetchReplys: Effect;
    commentLike: Effect;
    replyLike: Effect;
    sendComment: Effect;
    sendReply: Effect;
  };
  reducers: {
    save: Reducer<StateType>;
  };
}

const Model: ModelType = {
  namespace: 'articlesShow',

  state: {
    article: {},
    comments: [],
    commentsPagination: {
      current: 1,
      pageSize: 10,
    },
  },

  effects: {
    * fetchArticle({ id, payload }, { call, put }) {
      const { data: article } = yield call(queryArticle, id, payload);
      yield put({
        type: 'save',
        payload: { article },
      });
    },
    * fetchComments({ id, payload }, { call, put }) {
      const {
        data: comments,
        pagination: commentsPagination,
      } = yield call(queryComments, id, payload);

      yield put({
        type: 'save',
        payload: { comments, commentsPagination },
      });
    },
    * appendFetchComments({ articleId, payload }, { select, call, put }) {
      const { comments, commentsPagination } = yield select(({ articlesShow }) => articlesShow);

      const { data, pagination } = yield call(queryComments, articleId, {
        ...payload,
        page: (commentsPagination.current ? commentsPagination.current : 0) + 1,
      });

      const newComments = differenceWith(data, comments, (one: any, two: any) => one.id === two.id);

      yield put({
        type: 'save',
        payload: {
          comments: comments.concat(newComments),
          commentsPagination: pagination,
        },
      });
    },
    * appendFetchReplys({ commentId, payload }, { select, call, put }) {
      const hide = message.loading('正在请求...');

      const { comments } = yield select(({ articlesShow }) => articlesShow);

      const comment: CommentType = find(comments, comment => comment.id === commentId);

      const { replysPagination, replys = [] } = comment;

      const { data, pagination } = yield call(queryReplys, commentId, {
        ...payload,
        page: (replysPagination && replysPagination.current ? replysPagination.current : 0) + 1,
      });

      const newReplys = differenceWith(data, replys, (one: any, two: any) => one.id === two.id);

      comment.replys = replys.concat(newReplys);
      comment.replysPagination = pagination;

      yield put({
        type: 'save',
        payload: {
          comments,
        },
      });

      hide();
    },
    * commentLike({ commentId }, { call, select, put }) {
      const { data } = yield call(commentLike, commentId);

      const { comments } = yield select(({ articlesShow }) => articlesShow);

      const currentComment: CommentType = find(comments, comment => comment.id === commentId);

      currentComment.like_count = data.like_count;
      currentComment.likes = data.likes;

      yield put({
        type: 'save',
        payload: { comments },
      });
    },
    * replyLike({ commentId, replyId }, { call, select, put }) {
      const { data } = yield call(replyLike, replyId);

      const { comments } = yield select(({ articlesShow }) => articlesShow);
      const currentComment: CommentType = find(comments, comment => comment.id === commentId);
      const currentReply = find(currentComment.replys, reply => reply.id === replyId) as ReplyType;

      currentReply.like_count = data.like_count;
      currentReply.likes = data.likes;

      yield put({
        type: 'save',
        payload: { comments },
      });
    },
    * sendComment({ articleId, payload, callback }, { call, select, put }) {
      const { data } = yield call(postComment, articleId, payload);
      const { comments, article } = yield select(({ articlesShow }) => articlesShow);

      comments.unshift(data);
      article.comment_count++;

      yield put({
        type: 'save',
        payload: { comments, article },
      });

      if (callback) {
        callback();
      }
    },
    * sendReply({ commentId, payload, callback }, { call, select, put }) {
      const { data } = yield call(postReply, commentId, payload);

      const { comments } = yield select(({ articlesShow }) => articlesShow);
      const currentComment = find(comments, comment => comment.id === commentId);
      currentComment.read_count++;

      if (payload.parent_id) {
        const currentReplyIndex = findIndex(
          currentComment.replys,
          (reply: ReplyType) => reply.id === payload.parent_id,
        );
        currentComment.replys.splice(currentReplyIndex + 1, 0, data);
      } else {
        currentComment.replys.unshift(data);
      }

      yield put({
        type: 'save',
        payload: { comments },
      });

      if (callback) {
        callback();
      }
    },
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};

export default Model;
