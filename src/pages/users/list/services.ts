import { request } from 'umi';

export async function queryUsers(params?: object) {
  return request('users', {
    params,
  });
}

export async function getUserRoles(userId: number) {
  return request(`users/${userId}/roles`);
}

export async function getUserPermissions(userId: number) {
  return request(`users/${userId}/permissions`);
}

export async function assignPermissions(userId: number, data: object) {
  return request(`users/${userId}/assign_permissions`, {
    method: 'POST',
    data,
  });
}

export async function assignRoles(userId: number, data: object) {
  return request(`users/${userId}/assign_roles`, {
    method: 'POST',
    data,
  });
}
