import request from '@/utils/request';

export async function queryFavorites(params: object) {
  return request('/account/favorites', {
    params,
  });
}

export async function queryComments(params: object) {
  return request('/account/comments', {
    params,
  });
}

export async function queryReplys(params: object) {
  return request('/account/replys', {
    params,
  });
}

export async function queryLikes(params: object) {
  return request('/account/likes', {
    params,
  });
}
