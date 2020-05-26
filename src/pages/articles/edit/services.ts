import { request } from 'umi';

export async function updateArticle(id: number | string, data: object) {
  return request(`articles/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function queryArticle(id: number | string, params?: object) {
  return request(`articles/${id}`, {
    params,
  });
}
