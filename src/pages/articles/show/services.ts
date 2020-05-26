import { request } from 'umi';

export async function queryArticle(id: number | string, params?: object) {
  return request(`articles/${id}`, {
    params,
  });
}

export async function queryArticleComments(article_id: number | string, params?: object) {
  return request(`articles/${article_id}/comments`, {
    params,
  });
}

export async function storeArticleComment(article_id: number | string, params: object) {
  return request(`articles/${article_id}/comments`, {
    method: 'post',
    data: params,
  });
}
