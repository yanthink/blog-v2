import request from '@/utils/request';
import { QueryParamsType } from './data.d';

export async function queryList(params: QueryParamsType) {
  return request('/users', {
    params,
  });
}
