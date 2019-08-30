import request from '@/utils/request';

export async function queryList(params: object) {
  return request('/permissions', {
    params,
  });
}

export async function store(params: object) {
  return request('/permissions', {
    method: 'POST',
    data: params,
  });
}

export async function update(id: number | string, data: object) {
  return request(`/permissions/${id}`, {
    method: 'PUT',
    data,
  });
}
