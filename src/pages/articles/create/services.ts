import request from '@/utils/request';

export async function storeArticle (params: object) {
  return request('articles', {
    method: 'POST',
    data: params,
  });
}

export async function queryAllTags () {
  return request('tags/all');
}
