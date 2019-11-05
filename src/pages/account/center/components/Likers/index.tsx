import React from 'react';
import { Icon, List } from 'antd';
import { Link } from 'umi';
import { parse } from 'qs';
import { get } from 'lodash';
import { AccountCenterModelState, ConnectProps, Loading } from '@/models/connect';
import Ellipsis from '@/components/Ellipsis';
import MarkdownBody from '@/components/MarkdownBody';
import styles from './index.less';
import { IFollowable } from '@/models/data';

const defaultQueryParams = {
  include: 'followable.commentable',
};

const IconText: React.FC<{
  type: string;
  text: React.ReactNode;
}> = ({ type, text }) => (
  <span style={{ marginRight: 16 }}>
    <Icon type={type} style={{ marginRight: 4 }} />
    {text}
  </span>
);

interface LikesProps extends ConnectProps {
  loading: Loading;
  accountCenter: AccountCenterModelState;

  [key: string]: any;
}

class Likes extends React.Component<LikesProps> {
  UNSAFE_componentWillMount () {
    this.queryLikers(this.props.location.search);
  }

  queryLikers = (params: object | string) => {
    const query = params instanceof Object ? params : parse(params.replace(/^\?/, ''));

    const queryParams = {
      ...defaultQueryParams,
      ...query,
    };

    this.props.dispatch({
      type: 'accountCenter/fetchLikers',
      payload: queryParams,
    });
  };

  handlePageChange = (page: number, pageSize?: number) => {
    const { location: { search } } = this.props;
    const query = parse(search.replace(/^\?/, ''));
    this.queryLikers({ ...query, page, pageSize });
  };

  renderItemTitle = (item: IFollowable) => {
    switch (item.followable_type) {
      case 'App\\Models\\Article':
        return (
          <Link to={`/articles/${item.followable_id}`}>
            {get(item, 'followable.title')}
          </Link>
        );
      case 'App\\Models\\Comment':
        return (
          <Link to={`/articles/${get(item, 'followable.commentable_id')}`}>
            {get(item, 'followable.commentable.title')}
          </Link>
        );
      default:
        return null;
    }
  };

  renderItemDescription = (item: IFollowable) => {
    switch (item.followable_type) {
      case 'App\\Models\\Article':
        return (
          <Ellipsis lines={3}>
            {get(item, 'followable.content.markdown', '').substr(0, 360)}
          </Ellipsis>
        );
      case 'App\\Models\\Comment':
        return (
          <MarkdownBody markdown={get(item, 'followable.content.combine_markdown')} />
        );
      default:
        return null;
    }
  };

  render () {
    const {
      loading,
      accountCenter: { likers: { list, meta } },
    } = this.props;

    return (
      <div className={styles.list}>
        <List
          size="large"
          rowKey="id"
          itemLayout="vertical"
          loading={loading.effects['accountCenter/fetchLikers']}
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
              />
              <div className={`${styles.content}  markdown-body`}>
                <div className={styles.description}>
                  {this.renderItemDescription(item)}
                </div>
                <div className={styles.extra}>
                  <IconText type="clock-circle-o" text={item.created_at_timeago} />
                  <IconText
                    key="like"
                    type="like-o"
                    text={
                      get(item, 'followable.friendly_likes_count') ||
                      get(item, 'followable.friendly_up_voters_count')
                    }
                  />
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>
    );
  }
}

export default Likes;
