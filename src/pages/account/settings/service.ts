import request from '@/utils/request';
// @ts-ignore
import city from './geographic/city.json';
// @ts-ignore
import province from './geographic/province.json';

export async function queryProvince() {
  return province;
}

export async function queryCity(province: string) {
  return city[province];
}

export async function updateBaseInfo(params: object) {
  return request('/account/update_base_info', {
    method: 'POST',
    data: params,
  });
}

export async function updatePassword(params: object) {
  return request('/account/update_password', {
    method: 'POST',
    data: params,
  });
}
