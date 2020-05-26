import { request } from 'umi';
import { stringify } from 'qs';

export async function queryArticles(params: object) {
  return request(`articles?${stringify(params)}`);
}
