import request from '@/utils/request';

export async function queryPermissions (params: object) {
  return request('permissions', {
    params,
  });
}

export async function storePermission (params: object) {
  return request('permissions', {
    method: 'POST',
    data: params,
  });
}

export async function updatePermission (id: number | string, data: object) {
  return request(`permissions/${id}`, {
    method: 'PUT',
    data,
  });
}
