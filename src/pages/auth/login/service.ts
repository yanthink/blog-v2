import request from '@/utils/request';

export async function login(params: object) {
  return request('/auth/login', {
    method: 'POST',
    data: params,
  });
}
