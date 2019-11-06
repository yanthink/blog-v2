import request from '@/utils/request';

export async function queryRoles (params: object) {
  return request('roles', {
    params,
  });
}

export async function storeRole (params: object) {
  return request('roles', {
    method: 'POST',
    data: params,
  });
}

export async function updateRole (id: number | string, data: object) {
  return request(`roles/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function getAllPermissions () {
  return request('permissions/all');
}

export async function getRolePermissions (role_id: number | string) {
  return request(`roles/${role_id}/permissions`);
}

export async function assignPermissions (roleId: number | string, data: object) {
  return request(`roles/${roleId}/assign_permissions`, {
    method: 'POST',
    data,
  });
}
