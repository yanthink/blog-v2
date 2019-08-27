import request from '@/utils/request';

export async function login(params: object) {
  return request('/auth/login', {
    method: 'POST',
    data: params,
  });
}

export async function getLoginCode() {
  return request('/wechat/login_code');
}
