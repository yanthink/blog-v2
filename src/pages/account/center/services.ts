import { stringify } from 'qs';
import request from '@/utils/request';

export async function queryFollowRelations (params: object) {
  return request(`user/follow_relations?${stringify(params)}`);
}

export async function queryComments (params: object) {
  return request('user/comments', {
    params,
  });
}
