// @ts-ignore
import raf from 'raf';

/* eslint no-param-reassign:0 */
function easeInOutCubic(t: number, b: number, c: number, d: number) {
  const cc = c - b;
  t /= d / 2;
  if (t < 1) {
    return (cc / 2) * t * t * t + b;
  }
  return (cc / 2) * ((t -= 2) * t * t + 2) + b;
}

function getCurrentScrollTop(targetNode: HTMLElement | Window) {
  if (targetNode === window) {
    /* eslint @typescript-eslint/no-non-null-assertion:0 */
    return window.pageYOffset || document.body.scrollTop || document.documentElement!.scrollTop;
  }
  return (targetNode as HTMLElement).scrollTop;
}

function setScrollTop(targetNode: HTMLElement | Window, value: number) {
  if (targetNode === window) {
    document.body.scrollTop = value;
    document.documentElement!.scrollTop = value;
  } else {
    (targetNode as HTMLElement).scrollTop = value;
  }
}

export default function scrollToTop(targetNode: HTMLElement | Window = window, value: number = 0) {
  const scrollTop = getCurrentScrollTop(targetNode);
  const startTime = Date.now();
  const frameFunc = () => {
    const timestamp = Date.now();
    const time = timestamp - startTime;
    setScrollTop(targetNode, easeInOutCubic(time, scrollTop, value, 450));
    if (time < 450) {
      raf(frameFunc);
    } else {
      setScrollTop(targetNode, value);
    }
  };
  raf(frameFunc);
}
