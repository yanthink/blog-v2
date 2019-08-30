import request from '@/utils/request';

export async function queryList(params: object) {
  return request('/tags', {
    params,
  });
}

export async function store(params: object) {
  return request('/tags', {
    method: 'POST',
    data: params,
  });
}

export async function update(id: number | string, data: object) {
  return request(`/tags/${id}`, {
    method: 'PUT',
    data,
  });
}
