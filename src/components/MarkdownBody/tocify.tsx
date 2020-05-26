import React from 'react';
import { Anchor } from 'antd';
import { last } from 'lodash';
import escape from 'escape-string-regexp';

const { Link } = Anchor;

export interface TocItem {
  anchor: string;
  level: number;
  text: string;
  children?: TocItem[];
}

export type TocItems = TocItem[];

export default class Tocify {
  anchors: string[];

  tocItems: TocItems = [];

  constructor() {
    this.anchors = [];
    this.tocItems = [];
  }

  add(text: string, level: number, id: string = '') {
    let anchor = encodeURIComponent(id || text);
    const count = this.anchors.filter((value) =>
      new RegExp(`^${escape(anchor)}[0-9]*$`).test(value),
    ).length;
    if (count > 0) anchor += count;
    this.anchors.push(anchor);
    const item = { anchor, level, text };
    const items = this.tocItems;

    if (items.length === 0) {
      items.push(item);
    } else {
      let lastItem = last(items) as TocItem;

      if (item.level > lastItem.level) {
        for (let i = lastItem.level + 1; i <= 6; i++) {
          const { children } = lastItem;
          if (!children) {
            lastItem.children = [item];
            break;
          }

          lastItem = last(children) as TocItem;

          if (item.level <= lastItem.level) {
            children.push(item);
            break;
          }
        }
      } else {
        items.push(item);
      }
    }

    return anchor;
  }

  reset = () => {
    this.tocItems = [];
    this.anchors = [];
  };

  renderToc(items: TocItem[]) {
    return items.map((item) => (
      <Link key={item.anchor} href={`#${item.anchor}`} title={item.text}>
        {item.children && this.renderToc(item.children)}
      </Link>
    ));
  }

  render() {
    return (
      <Anchor style={{ padding: 24 }} affix showInkInFixed>
        {this.renderToc(this.tocItems)}
      </Anchor>
    );
  }
}
