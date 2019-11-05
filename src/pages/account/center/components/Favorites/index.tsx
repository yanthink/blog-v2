import React from 'react';
import { List, Tag } from 'antd';
import { Link } from 'umi';
import { parse } from 'qs';
import { get } from 'lodash';
import { ConnectProps, Loading, AccountCenterModelState } from '@/models/connect';
import { IArticle, IFollowable, ITag } from '@/models/data';
import ArticleListContent from '@/pages/articles/list/components/ArticleListContent';

const defaultQueryParams = {
  include: 'followable.user,followable.tags',
};

interface FavoritesProps extends ConnectProps {
  loading: Loading;
  accountCenter: AccountCenterModelState;

  [key: string]: any;
}

class Favorites extends React.Component<FavoritesProps> {
  UNSAFE_componentWillMount () {
    this.queryFavorites(this.props.location.search);
  }

  queryFavorites = (params: object | string) => {
    const query = params instanceof Object ? params : parse(params.replace(/^\?/, ''));

    const queryParams = {
      ...defaultQueryParams,
      ...query,
    };

    this.props.dispatch({
      type: 'accountCenter/fetchFavorites',
      payload: queryParams,
    });
  };

  handlePageChange = (page: number, pageSize?: number) => {
    const { location: { search } } = this.props;
    const query = parse(search.replace(/^\?/, ''));
    this.queryFavorites({ ...query, page, pageSize });
  };

  renderItemTitle = (item: IFollowable) => {
    switch (item.followable_type) {
      case 'App\\Models\\Article':
        return (
          <Link to={`/articles/${item.followable_id}`}>
            {(item.followable as IArticle).title}
          </Link>
        );
      default:
        return null;
    }
  };

  renderItemContent = (item: IFollowable) => {
    switch (item.followable_type) {
      case 'App\\Models\\Article':
        return <ArticleListContent data={item.followable as IArticle} />;
      default:
        return null;
    }
  };

  render () {
    const {
      loading,
      accountCenter: { favorites: { list, meta } },
    } = this.props;

    return (
      <List
        size="large"
        rowKey="id"
        itemLayout="vertical"
        loading={loading.effects['accountCenter/fetchFavorites']}
        dataSource={list}
        pagination={{
          total: meta.total,
          current: meta.current_page,
          pageSize: meta.per_page || 10,
          simple: window.innerWidth < 768,
          onChange: this.handlePageChange,
        }}
        renderItem={(item: IFollowable) => (
          <List.Item>
            <List.Item.Meta
              title={this.renderItemTitle(item)}
              description={(get(item, 'target.tags', []) as ITag[]).map((tag: ITag) => (
                <Tag key={tag.id}>{tag.name}</Tag>
              ))}
            />
            {this.renderItemContent(item)}
          </List.Item>
        )}
      />
    );
  }
}

export default Favorites;
