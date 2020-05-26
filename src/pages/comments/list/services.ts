import { request } from 'umi';

export async function queryComments(params?: object) {
  return request('comments', {
    params,
  });
}

export async function updateComment(id: number | string, data: object) {
  return request(`comments/${id}`, {
    method: 'PUT',
    data,
  });
}
