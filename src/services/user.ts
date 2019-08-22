import request from '@/utils/request';

export async function query(): Promise<any> {
  return request('/users');
}

export async function queryCurrent(): Promise<any> {
  return request('/users/current');
}
