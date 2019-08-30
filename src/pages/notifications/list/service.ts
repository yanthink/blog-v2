import request from '@/utils/request';

export async function queryList(params: object) {
  return request('/notifications', {
    params,
  });
}
