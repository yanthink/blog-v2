import request from '@/utils/request';
import { ArticleType } from '../list/data';

export async function store(params: ArticleType) {
  return request('/articles', {
    method: 'POST',
    data: params,
  });
}
