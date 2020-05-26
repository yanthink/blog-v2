import { request } from 'umi';
// @ts-ignore
import city from './geographic/city.json';
// @ts-ignore
import province from './geographic/province.json';

export async function queryProvince() {
  return { data: province };
}

export async function queryCity(p: string) {
  return { data: city[p] };
}

export async function updateBaseInfo(params: object) {
  return request('user/base_info', {
    method: 'POST',
    data: params,
  });
}

export async function updateSettings(params: object) {
  return request('user/settings', {
    method: 'POST',
    data: params,
  });
}

export async function updatePassword(params: object) {
  return request('user/password', {
    method: 'POST',
    data: params,
  });
}

export async function sendEmailCode(email: string) {
  return request('user/send_email_code', {
    method: 'POST',
    data: { email },
  });
}
