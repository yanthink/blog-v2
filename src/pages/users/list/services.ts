import request from '@/utils/request';

export async function queryUsers (params: object) {
  return request('users', {
    params,
  });
}

export async function getAllRoles () {
  return request('roles/all');
}

export async function getUserRoles (user_id: number | string) {
  return request(`users/${user_id}/roles`);
}

export async function getAllPermissions () {
  return request('permissions/all');
}

export async function getUserPermissions (user_id: number | string) {
  return request(`users/${user_id}/permissions`);
}

export async function assignPermissions (user_id: number | string, data: object) {
  return request(`users/${user_id}/assign_permissions`, {
    method: 'POST',
    data,
  });
}

export async function assignRoles (user_id: number | string, data: object) {
  return request(`users/${user_id}/assign_roles`, {
    method: 'POST',
    data,
  });
}
