import { request } from 'umi';

export async function queryNotifications(params: object) {
  return request('user/notifications', {
    params,
  });
}
