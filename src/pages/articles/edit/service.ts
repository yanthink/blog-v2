import request from '@/utils/request';
import { ArticleType } from '../list/data';

export async function update(id: number | string, data: ArticleType) {
  return request(`/articles/${id}`, {
    method: 'PUT',
    data,
  });
}
