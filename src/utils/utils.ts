import moment from 'moment';
import marked from 'marked';
import Prism from 'prismjs';
import { parse } from 'qs';
import pathRegexp from 'path-to-regexp';
import { Route } from '@/models/connect';
import { ResponseResultType } from '@/models/I';

export const getPageQuery = () => parse(window.location.href.split('?')[1]);

/**
 * props.route.routes
 * @param router [{}]
 * @param pathname string
 */
export const getAuthorityFromRouter = <T extends Route>(
  router: T[] = [],
  pathname: string,
): T | undefined => {
  const authority = router.find(
    // @ts-ignore
    ({ routes, path = '/', target = '_self' }) =>
      (path && target !== '_blank' && pathRegexp(path).exec(pathname)) ||
      (routes && getAuthorityFromRouter(routes, pathname)),
  );
  if (authority) return authority;
  return undefined;
};

export function diffForHumans(time?: string) {
  const mtime = moment(time);
  const now = moment();

  if (now.diff(mtime, 'day') > 15) {
    return mtime.year() === now.year()
      ? mtime.format('MM-DD HH:ss')
      : mtime.format('YYYY-MM-DD HH:ss');
  }

  return mtime.fromNow();
}

export function friendlyNumbers(n: number) {
  if (n >= 1000) {
    return `${Math.floor(n / 1000)}k`;
  }

  return String(n);
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

export function rendererParagraph(text: string) {
  // replaceUserMention
  const regExp = /(^| +)@(?!_)(?!.*?_$)(?<username>[a-zA-Z0-9_\u4e00-\u9fa5]{1,10})( +|$)/g;
  return `<p>${text.replace(regExp, '$1<a href="/$2">@$2</a>$3')}</p>`;
}

export function getDefaultMarkedOptions() {
  const renderer = new marked.Renderer();
  renderer.link = rendererLink;
  renderer.paragraph = rendererParagraph;

  return {
    renderer,
    headerIds: false,
    gfm: true,
    breaks: true,
    highlight(code: string, lang: string) {
      if (lang) {
        const language = lang.toLowerCase();
        const grammar = Prism.languages[language];
        if (grammar) {
          return Prism.highlight(code, grammar, language);
        }
      }

      return code;
    },
  };
}

export function resetMarkedOptions() {
  marked.setOptions(getDefaultMarkedOptions());
}

/* eslint no-param-reassign:0, one-var:0, object-shorthand:0, no-loop-func:0 */

/* eslint eqeqeq:0, no-multi-assign:0, no-multiple-empty-lines:0 */
export function getPositions(dom: HTMLElement) {
  let left = dom.offsetLeft,
    top = dom.offsetTop + dom.scrollTop,
    current = dom.offsetParent;

  while (current !== null) {
    // @ts-ignore
    left += current.offsetLeft;
    // @ts-ignore
    top += current.offsetTop;
    // @ts-ignore
    current = current.offsetParent;
  }
  return { left: left, top: top };
}

export function isParentElement(childElement: any, parentElement: any) {
  const pEls = !Array.isArray(parentElement) ? [parentElement] : parentElement;
  while (childElement.tagName.toUpperCase() !== 'BODY') {
    if (pEls.some((el) => childElement == el)) {
      return true;
    }
    // @ts-ignore
    childElement = childElement.parentNode;
  }
  return false;
}

export function insertText(texteara: HTMLTextAreaElement, str: string): string {
  // @ts-ignore
  if (document.selection) {
    // @ts-ignore
    const sel = document.selection.createRange();
    sel.text = str;
  } else if (
    typeof texteara.selectionStart === 'number' &&
    typeof texteara.selectionEnd === 'number'
  ) {
    const startPos = texteara.selectionStart;
    const endPos = texteara.selectionEnd;
    let cursorPos = startPos;
    const tmpStr = texteara.value;
    texteara.value = tmpStr.substring(0, startPos) + str + tmpStr.substring(endPos, tmpStr.length);
    cursorPos += str.length;
    texteara.selectionStart = texteara.selectionEnd = cursorPos;
  } else {
    texteara.value += str;
  }

  return texteara.value;
}

export function moveEnd(texteara: HTMLTextAreaElement) {
  texteara.focus();
  const len = texteara.value.length;
  // @ts-ignore
  if (document.selection) {
    // @ts-ignore
    const sel = texteara.createTextRange();
    sel.moveStart('character', len);
    sel.collapse();
    sel.select();
  } else if (
    typeof texteara.selectionStart == 'number' &&
    typeof texteara.selectionEnd == 'number'
  ) {
    texteara.selectionStart = texteara.selectionEnd = len;
  }
}

export function scrollToAnchor(id: string) {
  const dom = document.getElementById(id);
  dom?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
    inline: 'start',
  });
}

export function umiformatPaginationResult(res: ResponseResultType<any>) {
  return {
    list: res.data,
    total: res.meta!.total!,
    meta: res.meta!,
  };
}
