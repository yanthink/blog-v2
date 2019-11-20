/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { extend } from 'umi-request';
import { notification } from 'antd';
import { getSocketId, getToken } from '@/utils/authority';

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

/**
 * 异常处理程序
 */
const errorHandler = async (error: { response: Response }): Promise<void> => {
  const { response } = error;
  if (response && response.status) {
    const { status, url } = response;

    const errorText = codeMessage[response.status] || response.statusText;
    const { message: msg } = await response.json();

    switch (status) {
      case 401:
        window.g_app._store.dispatch({ type: 'auth/logout' });
        break;
      case 400:
      case 403:
      case 404:
      case 422:
      case 429:
        notification.error({
          message: `请求错误 ${status}: ${url}`,
          description: msg || errorText,
        });
        break;
      case 500:
      case 501:
      case 503:
        notification.error({
          message: `请求错误 ${status}: ${url}`,
          description: msg || errorText,
        });
    }


    const error: any = new Error(msg || errorText);
    error.response = response;
    throw error;
  }
};

/**
 * 配置request请求时的默认参数
 */
const request = extend({
  prefix: API_URL,
  errorHandler, // 默认错误处理
  credentials: 'omit', // 默认请求是否带上cookie
  headers: {
    Accept: 'application/json', // eslint-disable-line
    'Content-Type': 'application/json; charset=utf-8',
    'X-Client': 'browser',
  },
});

// request拦截器, 改变url 或 options.
/* eslint no-param-reassign:0 */
request.interceptors.request.use((url, options) => {
  const { headers } = options;

  options.headers = {
    ...headers,
    Authorization: `Bearer ${getToken()}`,
    'X-Socket-ID': getSocketId(),
  };

  return { url, options };
});

// response拦截器, 处理response
request.interceptors.response.use(response => {
  /* eslint no-undef:0, valid-typeof:0 */
  if (typeof phpdebugbar !== undefined) {
    try {
      const {
        ajaxHandler: { headerName },
      } = phpdebugbar;
      const debugBarData = response.headers.get(headerName);
      const debugBarId = response.headers.get(`${headerName}-id`);
      if (debugBarData) {
        const { id, data } = JSON.parse(decodeURIComponent(debugBarData));
        phpdebugbar.addDataSet(data, id);
      } else if (debugBarId && phpdebugbar.openHandler) {
        phpdebugbar.loadDataSet(debugBarId, '(ajax)');
      }
    } catch (e) {
      //
    }
  }

  return response;
});

export default request;
