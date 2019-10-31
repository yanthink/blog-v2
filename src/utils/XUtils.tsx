import { IMeta } from '@/models/data';
import { PaginationProps } from 'antd/es/pagination';
import { Icon } from 'antd';
import { Link } from 'umi';
import { stringify } from 'qs';
import React from 'react';

export function getAntdPaginationProps (meta: IMeta, pathname: string, query: object): PaginationProps {
  return {
    total: meta.total,
    current: meta.current_page,
    pageSize: meta.per_page || 10,
    simple: window.innerWidth < 768,
    itemRender (page, type, originalElement) {
      let children: any = page;

      if (type === 'prev') {
        children = <Icon type="left" />;
      } else if (type === 'next') {
        children = <Icon type="right" />;
      } else if (type === 'jump-prev') {
        children = (
          <div className="ant-pagination-item-container">
            <Icon className="ant-pagination-item-link-icon" type="double-left" />
            <span className="ant-pagination-item-ellipsis">•••</span>
          </div>
        );
      } else if (type === 'jump-next') {
        children = (
          <div className="ant-pagination-item-container">
            <Icon className="ant-pagination-item-link-icon" type="double-right" />
            <span className="ant-pagination-item-ellipsis">•••</span>
          </div>
        );
      }

      return (
        // @ts-ignore
        <Link
          {...originalElement.props}
          to={`${pathname}?${stringify({ ...query, page })}`}
        >
          {children}
        </Link>
      );
    },
  };
}
