import request from '@/utils/request';

export async function queryArticle(id: number | string, params: any) {
  return request(`/articles/${id}`, {
    params,
  });
}

export async function queryComments(articleId: number | string, params: any) {
  return request(`/articles/${articleId}/comments`, {
    params,
  });
}

export async function queryReplys(commentId: number | string, params: any) {
  return request(`/comments/${commentId}/replys`, {
    params,
  });
}

export async function commentLike(commentId: number | string) {
  return request(`/comments/${commentId}/like`, {
    method: 'post',
  });
}

export async function replyLike(replyId: number | string) {
  return request(`/replys/${replyId}/like`, {
    method: 'post',
  });
}

export async function postComment(articleId: number | string, params: any) {
  return request(`/articles/${articleId}/comments`, {
    method: 'post',
    data: params,
  });
}

export async function postReply(commentId: number | string, params: any) {
  return request(`/comments/${commentId}/replys`, {
    method: 'post',
    data: params,
  });
}
