import { request } from 'umi';

export async function login(params: object) {
  return request('auth/login', {
    method: 'POST',
    data: params,
  });
}

export async function loadUserData() {
  return request('me');
}

export async function searchUsers(q: string) {
  return request('search/users', {
    params: { q },
  });
}

export async function fetchAllTags() {
  return request('tags/all');
}

export async function getAllRoles() {
  return request('roles/all');
}

export async function getAllPermissions() {
  return request('permissions/all');
}

export async function getHotKeywords() {
  return request('keywords/hot');
}
