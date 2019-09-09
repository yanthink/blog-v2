/* eslint no-useless-escape:0 import/prefer-default-export:0 */
import moment from 'moment';
import marked from 'marked';
import { stringify } from 'qs';

const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export function isUrl(path: string): boolean {
  return reg.test(path);
}

export function showTime(time: string, level = 4): string {
  const mTime = moment(time);
  const diffSeconds = moment().diff(mTime, 's');
  const u = ['年', '个月', '星期', '天', '小时', '分钟', '秒'];
  const t = [31536000, 2592000, 604800, 86400, 3600, 60, 1];

  if (diffSeconds > t[level]) {
    if (moment().year() === mTime.year()) {
      return mTime.format('MM-DD HH:mm');
    }

    return mTime.format('YYYY-MM-DD HH:mm');
  }

  for (let i = 1; i <= 6; i++) {
    // eslint-disable-line
    const inm = Math.floor(diffSeconds / t[i]);

    if (inm !== 0) {
      return `${inm}${u[i]}前`;
    }
  }

  return time;
}

const dynamicLoaded: string[] = [];

export function dynamicLoad(srcs: string | string[]): Promise<any> {
  const srcList = Array.isArray(srcs) ? srcs : srcs.split(/\s+/);
  return Promise.all(
    srcList.map(src => {
      if (!dynamicLoaded[src]) {
        dynamicLoaded[src] = new Promise((resolve, reject) => {
          if (src.indexOf('.css') > 0) {
            const style = document.createElement('link');
            style.rel = 'stylesheet';
            style.type = 'text/css';
            style.href = src;
            style.onload = e => resolve(e);
            style.onerror = e => reject(e);
            document.head && document.head.appendChild(style);
          } else {
            const script = document.createElement('script');
            script.async = true;
            script.src = src;
            script.onload = e => resolve(e);
            script.onerror = e => reject(e);
            document.head && document.head.appendChild(script);
          }
        });
      }

      return dynamicLoaded[src];
    }),
  );
}

export function randomString(len: number) {
  const text = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  const rdmIndex = (text: string) => Math.random() * text.length || 0;

  let rdmString = '';

  while (rdmString.length < len) {
    rdmString += text.charAt(rdmIndex(text));
  }

  return rdmString;
}

export function rendererLink(href: string, title: string, text: string) {
  let url = href;
  let target: boolean | string = false;

  if (url.slice(0, 1) !== '#') {
    const urlParams = new URL(href, window.location.origin);

    url = urlParams.href;

    target = urlParams.host !== window.location.host ? '_blank' : false;
  }

  if (!url) {
    return text;
  }

  let out = `<a href="${url}"`;
  if (title) {
    out += ` title="${title}"`;
  }
  if (target !== false) {
    out += ` target="${target}"`;
  }
  out += `>${text}</a>`;

  return out;
}

export function getDefaultMarkedOptions() {
  const renderer = new marked.Renderer();
  renderer.link = rendererLink;

  return {
    renderer,
    headerIds: false,
    gfm: true,
    breaks: true,
  };
}

export function resetMarkedOptions() {
  marked.setOptions(getDefaultMarkedOptions());
}

export function getSocketUrl(params: object) {
  const socketUrl = process.env.NODE_ENV === 'development'
    ? 'wss://api.blog.test/wss'
    : `wss://${window.location.host}/wss`;

  return `${socketUrl}?${stringify(params)}`;
}
