import React from 'react';
import { List, Tag } from 'antd';
import { Link } from 'umi';
import { parse } from 'qs';
import { get } from 'lodash';
import { ConnectProps, Loading, AccountCenterModelState } from '@/models/connect';
import { IFavorite, ITag } from '@/models/data';
import ArticleListContent from '@/pages/articles/list/components/ArticleListContent';

const defaultQueryParams = {
  include: 'target.author,target.tags',
};

interface FavoritesProps extends ConnectProps {
  loading: Loading;
  accountCenter: AccountCenterModelState;

  [key: string]: any;
}

class Favorites extends React.Component<FavoritesProps> {
  UNSAFE_componentWillMount() {
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

  renderItemTitle = (favorite: IFavorite) => {
    if (favorite.target_type === 'App\\Models\\Article') {
      return (
        <Link to={`/articles/${favorite.target_id}/show`}>
          {get(favorite, 'target.title')}
        </Link>
      );
    }

    return null;
  };

  renderItemContent = (favorite: IFavorite) => {
    if (favorite.target && favorite.target_type === 'App\\Models\\Article') {
      return (
        <ArticleListContent data={favorite.target} />
      );
    }

    return null;
  };

  render() {
    const {
      loading,
      accountCenter: { favorites: { list, pagination } },
    } = this.props;

    return (
      <List
        size="large"
        rowKey="id"
        itemLayout="vertical"
        loading={loading.effects['accountCenter/fetchFavorites']}
        dataSource={list}
        pagination={{
          ...pagination,
          simple: window.innerWidth < 768,
          onChange: this.handlePageChange,
        }}
        renderItem={(item: IFavorite) => (
          <List.Item
            key={item.id}
          >
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
