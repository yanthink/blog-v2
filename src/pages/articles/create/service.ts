import request from '@/utils/request';

export async function store(params: object) {
  return request('/articles', {
    method: 'POST',
    data: params,
  });
}
