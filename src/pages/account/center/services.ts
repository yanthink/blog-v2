import { request } from 'umi';

export async function queryFollowRelations(params: object) {
  return request('user/follow_relations', {
    params,
  });
}

export async function queryComments(params: object) {
  return request('user/comments', {
    params,
  });
}
