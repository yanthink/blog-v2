import { request } from 'umi';

export async function fetchSensitiveWords() {
  return request('sensitive_words');
}

export async function updateSensitiveWords(data: object) {
  return request('sensitive_words', {
    method: 'put',
    data,
  });
}
