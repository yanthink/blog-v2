import React from 'react';
import { Anchor } from 'antd';
import { last } from 'lodash';

const { Link } = Anchor;

export interface TocItem {
  anchor: string;
  level: number;
  text: string;
  children?: TocItem[];
}

export type TocItems = TocItem[];

export default class Tocify {
  tocItems: TocItems = [];

  index: number = 0;

  constructor() {
    this.tocItems = [];
    this.index = 0;
  }

  add(text: string, level: number, id = '') {
    const anchor = id || `toc${level}${++this.index}`;
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
    this.index = 0;
  };

  renderToc(items: TocItem[]) {
    return items.map(item => (
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
