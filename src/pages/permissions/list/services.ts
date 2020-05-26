import { request } from 'umi';

export async function queryPermissions(params?: object) {
  return request('permissions', {
    params,
  });
}

export async function storePermission(data: object) {
  return request('permissions', {
    method: 'POST',
    data,
  });
}

export async function updatePermission(id: number, data: object) {
  return request(`permissions/${id}`, {
    method: 'PUT',
    data,
  });
}
