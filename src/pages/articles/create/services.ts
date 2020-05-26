import { request } from 'umi';

export async function storeArticle(params: object) {
  return request('articles', {
    method: 'POST',
    data: params,
  });
}
