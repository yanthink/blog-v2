import request from '@/utils/request';

export async function query(): Promise<any> {
  return request('/users');
}

export async function queryCurrent(): Promise<any> {
  return request('/users/current');
}

export async function queryNotices(): Promise<any> {
  return request('/notices');
}
