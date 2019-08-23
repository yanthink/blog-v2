import request from '@/utils/request';

export async function update(id: number | string, data: object) {
  return request(`/articles/${id}`, {
    method: 'PUT',
    data,
  });
}
