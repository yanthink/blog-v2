import store from 'store';
import { CurrentAuthorityType } from '@/components/Authorized/renderAuthorize';

const USER_TOKEN_STORAGE_KEY = 'APP_USER_TOKEN';
const AUTHORITY_STORAGE_KEY = 'APP_AUTHORITY';
window.SOCKET_ID = '';

export function getToken(): string {
  return store.get(USER_TOKEN_STORAGE_KEY);
}

export function setToken(token = '') {
  store.set(USER_TOKEN_STORAGE_KEY, token);
}

export function getAuthority(): CurrentAuthorityType {
  return store.get(AUTHORITY_STORAGE_KEY);
}

export function setAuthority(authority: CurrentAuthorityType = []) {
  const proAuthority = typeof authority === 'string' ? [authority] : authority;
  store.set(AUTHORITY_STORAGE_KEY, proAuthority);
}

export function getSocketId() {
  return window.SOCKET_ID;
}

export function setSocketId(id: string) {
  window.SOCKET_ID = id;
}
