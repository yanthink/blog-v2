import request from '@/utils/request';

export async function queryOnline(params: object) {
  return request('/users_online', {
    params,
  });
}
