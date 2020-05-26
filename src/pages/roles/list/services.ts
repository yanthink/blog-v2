import { request } from 'umi';

export async function queryRoles(params?: object) {
  return request('roles', {
    params,
  });
}

export async function storeRole(data: object) {
  return request('roles', {
    method: 'POST',
    data,
  });
}

export async function updateRole(id: number, data: object) {
  return request(`roles/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function getRolePermissions(roleId: number) {
  return request(`roles/${roleId}/permissions`);
}

export async function assignPermissions(roleId: number, data: object) {
  return request(`roles/${roleId}/assign_permissions`, {
    method: 'POST',
    data,
  });
}
