import request from '@/utils/request';
import { FromDataType } from './index';

export async function login(params: FromDataType) {
  return request('/auth/login', {
    method: 'POST',
    data: params,
  });
}
