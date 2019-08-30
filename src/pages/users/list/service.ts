import request from '@/utils/request';

export async function queryList(params: object) {
  return request('/users', {
    params,
  });
}

export async function getAllRoles() {
  return request('/roles/all');
}

export async function getUserRoles(userId: number | string) {
  return request(`/users/${userId}/roles`);
}

export async function getAllPermissions() {
  return request('/permissions/all');
}

export async function getUserPermissions(userId: number | string) {
  return request(`/users/${userId}/permissions`);
}

export async function assignPermissions(userId: number | string, data: object) {
  return request(`/users/${userId}/assign_permissions`, {
    method: 'POST',
    data,
  });
}

export async function assignRoles(userId: number | string, data: object) {
  return request(`/users/${userId}/assign_roles`, {
    method: 'POST',
    data,
  });
}
