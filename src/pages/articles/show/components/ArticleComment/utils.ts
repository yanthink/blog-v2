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
    if (pEls.some(el => childElement == el)) {
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
  } else if (typeof texteara.selectionStart === 'number' && typeof texteara.selectionEnd === 'number') {
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
  } else if (typeof texteara.selectionStart == 'number' && typeof texteara.selectionEnd == 'number') {
    texteara.selectionStart = texteara.selectionEnd = len;
  }
}

