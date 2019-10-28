import store from 'store';
import { CurrentAuthorityType } from '@/components/Authorized/renderAuthorize';


export function getToken(): string {
  return store.get(USER_TOKEN_STORAGE_KEY);
}

export function setToken(token = ''): void {
  store.set(USER_TOKEN_STORAGE_KEY, token);
}

export function getAuthority(): CurrentAuthorityType {
  return store.get(AUTHORITY_STORAGE_KEY);
}

export function setAuthority(authority: CurrentAuthorityType = []): void {
  const proAuthority = typeof authority === 'string' ? [authority] : authority;
  store.set(AUTHORITY_STORAGE_KEY, proAuthority);
}

export function getSocketId() {
  return store.get(SOCKET_ID_STORAGE_KEY);
}

export function setSocketId(id: string) {
  store.set(SOCKET_ID_STORAGE_KEY, id);
}
