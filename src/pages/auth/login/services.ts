import { request } from 'umi';

export async function getLoginCode() {
  return request('auth/login_code');
}
