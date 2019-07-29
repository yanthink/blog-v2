import request from '@/utils/request';

export async function queryArticle(id: number | string, params: any) {
  return request(`/articles/${id}`, {
    params,
  });
}
