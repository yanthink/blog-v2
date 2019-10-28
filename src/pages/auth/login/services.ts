import request from '@/utils/request';

export async function getLoginCode () {
  return request('auth/login_code');
}
