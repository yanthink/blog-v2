import store from 'store';
import { CurrentAuthorityType } from '@/components/Authorized/renderAuthorize';


export function getToken(): string {
  return store.get('token', '');
}

export function setToken(token = ''): void {
  store.set('token', token);
}

export function getAuthority(): CurrentAuthorityType {
  return store.get('antd-pro-authority');
}

export function setAuthority(authority: CurrentAuthorityType = []): void {
  const proAuthority = typeof authority === 'string' ? [authority] : authority;
  return store.set('antd-pro-authority', proAuthority);
}
