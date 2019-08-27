/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { extend } from 'umi-request';
import { notification } from 'antd';
import cookie from 'cookie';
import { getToken } from '@/utils/authority';

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

    if (status === 401) {
      // @ts-ignore https://umijs.org/zh/guide/with-dva.html#faq
      window.g_app._store.dispatch({ type: 'login/logout' });
    }

    const errorText = codeMessage[response.status] || response.statusText;
    const { message: msg } = await response.json();

    notification.error({
      message: `请求错误 ${status}: ${url}`,
      description: msg || errorText,
    });

    const error: any = new Error(msg || errorText);
    error.response = response;
    throw error;
  }
};

/**
 * 配置request请求时的默认参数
 */
const request = extend({
  prefix: '/api',
  errorHandler, // 默认错误处理
  credentials: 'include', // 默认请求是否带上cookie
  headers: {
    Accept: `application/x.sheng.${API_VERSION || 'v1'}+json`, // eslint-disable-line
    'Content-Type': 'application/json; charset=utf-8',
  },
});

// request拦截器, 改变url 或 options.
/* eslint no-param-reassign:0 */
request.interceptors.request.use((url, options) => {
  const { headers } = options;

  options.headers = {
    ...headers,
    Authorization: getToken(),
    'X-XSRF-TOKEN': cookie.parse(document.cookie)['XSRF-TOKEN'],
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

  const unreadCount = response.headers.get('unread_count');
  if (unreadCount !== null) {
    // @ts-ignore
    const { currentUser } = window.g_app._store.getState().user;
    if (currentUser && currentUser.name) {
      // @ts-ignore
      window.g_app._store.dispatch({
        type: 'user/saveCurrentUser',
        payload: {
          ...currentUser,
          unread_count: unreadCount,
        },
      });
    }
  }

  return response;
});

export default request;
