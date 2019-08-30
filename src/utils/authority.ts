import store from 'store';
import { CurrentAuthorityType } from '@/components/Authorized/renderAuthorize';

let GTOKEN = '';

export function getToken(): string {
  if (!GTOKEN) {
    GTOKEN = store.get('token', '');
  }
  return GTOKEN;
}

export function setToken(token = ''): void {
  GTOKEN = token;
  store.set('token', token);
}

export function getAuthority(): CurrentAuthorityType {
  return store.get('antd-pro-authority');
}

export function setAuthority(authority: CurrentAuthorityType = []): void {
  const proAuthority = typeof authority === 'string' ? [authority] : authority;
  return store.set('antd-pro-authority', proAuthority);
}
