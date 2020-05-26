import { request } from 'umi';

export async function queryTags(params: object) {
  return request('tags', {
    params,
  });
}

export async function storeTag(params: object) {
  return request('tags', {
    method: 'POST',
    data: params,
  });
}

export async function updateTag(id: number | string, data: object) {
  return request(`tags/${id}`, {
    method: 'PUT',
    data,
  });
}
