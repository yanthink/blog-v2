import { stringify } from 'qs';
import request from '@/utils/request';
import { QueryParamsType } from './data';

export async function queryList(params: QueryParamsType) {
  return request(`/articles?${stringify(params)}`);
}

export async function queryAllTags() {
  return request('/tags/all');
}
