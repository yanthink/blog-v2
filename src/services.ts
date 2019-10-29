import request from '@/utils/request';

export async function login (params: object) {
  return request('auth/login', {
    method: 'POST',
    data: params,
  });
}

export async function loadUserData () {
  return request('me');
}

export async function searchUsers (q: string) {
  return request('search/users', {
    params: { q },
  });
}
