// https://umijs.org/zh/guide/with-dva.html#%E9%85%8D%E7%BD%AE%E5%8F%8A%E6%8F%92%E4%BB%B6
// https://dvajs.com/api/
import { RequestConfig } from 'umi';
import { getToken, getSocketId } from '@/utils/authority';

export const request: RequestConfig = {
  timeout: 30000,
  prefix: '/api/',
  credentials: 'omit',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Socket-ID': getSocketId(),
  },
  errorConfig: {
    adaptor: (resData) => ({
      ...resData,
      errorMessage: resData.message,
    }),
  },
  middlewares: [
    async function withToken(ctx, next) {
      ctx.req.options.headers = {
        ...ctx.req.options.headers,
        Authorization: `Bearer ${getToken()}`,
      };
      await next();
    },
  ],
};

// https://umijs.org/zh/guide/with-dva.html#%E9%85%8D%E7%BD%AE%E5%8F%8A%E6%8F%92%E4%BB%B6
// https://dvajs.com/api/
export const dva = {
  config: {
    onError(e: any) {
      // effect 执行错误或 subscription 通过 done 主动抛错时触发
      e.preventDefault();
    },
  },
};

let lastPathname = '';

export function onRouteChange({ location }: any) {
  if (lastPathname !== location.pathname) {
    window.scrollTo(0, 0);
    lastPathname = location.pathname;
  }
}
