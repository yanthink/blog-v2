import React from 'react';
import { Link, useRequest } from 'umi';
import { List, Tag } from 'antd';
import { umiformatPaginationResult } from '@/utils/utils';
import { IArticle, IFollowable, ResponseResultType } from '@/models/I';
import ArticleListContent from '@/pages/articles/list/components/ArticleListContent';
import * as services from '../../services';

interface FavoritesProps {}

const Favorites: React.FC<FavoritesProps> = () => {
  const { loading, data, pagination } = useRequest<ResponseResultType<IFollowable[]>, IFollowable>(
    ({ current, pageSize }) =>
      services.queryFollowRelations({
        relation: 'favorite',
        page: current,
        per_page: pageSize,
        include: 'followable.user,followable.tags',
      }),
    {
      paginated: true,
      formatResult: umiformatPaginationResult,
    },
  );

  function renderItemTitle(item: IFollowable) {
    switch (item.followable_type) {
      case 'App\\Models\\Article':
        return (
          <Link to={`/articles/${item.followable_id}`}>{(item.followable as IArticle)?.title}</Link>
        );
      default:
        return null;
    }
  }

  function renderItemContent(item: IFollowable) {
    switch (item.followable_type) {
      case 'App\\Models\\Article':
        return item.followable && <ArticleListContent data={item.followable as IArticle} />;
      default:
        return null;
    }
  }

  return (
    <List
      size="large"
      rowKey="id"
      itemLayout="vertical"
      loading={loading}
      dataSource={data?.list}
      pagination={{
        ...(pagination as any),
        responsive: true,
      }}
      renderItem={(item: IFollowable) => (
        <List.Item>
          <List.Item.Meta
            title={renderItemTitle(item)}
            description={(item.followable as IArticle)?.tags!.map((tag) => (
              <Tag key={tag.id}>{tag.name}</Tag>
            ))}
          />
          {renderItemContent(item)}
        </List.Item>
      )}
    />
  );
};

export default Favorites;
