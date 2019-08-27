import request from '@/utils/request';

export async function queryNotifications(params: object) {
  return request('/account/notifications', {
    params,
  });
}
