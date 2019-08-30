import request from '@/utils/request';

export async function queryList(params: object) {
  return request('/roles', {
    params,
  });
}

export async function store(params: object) {
  return request('/roles', {
    method: 'POST',
    data: params,
  });
}

export async function update(id: number | string, data: object) {
  return request(`/roles/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function getAllPermissions() {
  return request('/permissions/all');
}

export async function getRolePermissions(roleId: number | string) {
  return request(`/roles/${roleId}/permissions`);
}

export async function assignPermissions(roleId: number | string, data: object) {
  return request(`/roles/${roleId}/assign_permissions`, {
    method: 'POST',
    data,
  });
}
