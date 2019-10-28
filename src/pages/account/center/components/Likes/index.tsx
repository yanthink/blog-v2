import React from 'react';
import { Icon, List } from 'antd';
import { Link } from 'umi';
import marked from 'marked';
// @ts-ignore
import emojiToolkit from 'emoji-toolkit';
import { parse } from 'qs';
import { get } from 'lodash';
import { AccountCenterModelState, ConnectProps, Loading } from '@/models/connect';
import { IComment, ILike, IReply } from '@/models/data';
import Ellipsis from '@/components/Ellipsis';
import { showTime } from '@/utils/utils';
import styles from './index.less';

const defaultQueryParams = {
  include: 'target.target.target',
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
  UNSAFE_componentWillMount() {
    this.queryLikes(this.props.location.search);
  }

  queryLikes = (params: object | string) => {
    const query = params instanceof Object ? params : parse(params.replace(/^\?/, ''));

    const queryParams = {
      ...defaultQueryParams,
      ...query,
    };

    this.props.dispatch({
      type: 'accountCenter/fetchLikes',
      payload: queryParams,
    });
  };

  handlePageChange = (page: number, pageSize?: number) => {
    const { location: { search } } = this.props;
    const query = parse(search.replace(/^\?/, ''));
    this.queryLikes({ ...query, page, pageSize });
  };

  renderItemTitle = (like: ILike) => {
    if (like.target_type === 'App\\Models\\Article') {
      return (
        <Link to={`/articles/${like.target_id}/show`}>
          {get(like, 'target.title')}
        </Link>
      );
    }

    if (like.target && like.target_type === 'App\\Models\\Comment') {
      return (
        <Link to={`/articles/${(like.target as IComment).target_id}/show`}>
          {get(like, 'target.target.title')}
        </Link>
      );
    }

    if (like.target && (like.target as IReply).target && like.target_type === 'App\\Models\\Reply') {
      return (
        <Link to={`/articles/${((like.target as IReply).target as IComment).target_id}/show`}>
          {get(like, 'target.target.target.title')}
        </Link>
      );
    }

    return null;
  };

  renderItemDescription = (like: ILike) => {
    if (like.target_type === 'App\\Models\\Article') {
      return (
        <Ellipsis lines={3}>
          <span>{get(like, 'target.content')}</span>
        </Ellipsis>
      );
    }

    return (
      <span
        dangerouslySetInnerHTML={{
          __html: emojiToolkit.toImage(marked(get(like, 'target.content'))),
        }}
      />
    );
  };

  render() {
    const {
      loading,
      accountCenter: { likes: { list, pagination } },
    } = this.props;

    return (
      <div className={styles.list}>
        <List
          size="large"
          rowKey="id"
          itemLayout="vertical"
          loading={loading.effects['accountCenter/fetchLikes']}
          dataSource={list}
          pagination={{
            ...pagination,
            simple: window.innerWidth < 768,
            onChange: this.handlePageChange,
          }}
          renderItem={(item: ILike) => (
            <List.Item
              key={item.id}
            >
              <List.Item.Meta
                title={this.renderItemTitle(item)}
              />
              <div className={`${styles.content}  markdown-body`}>
                <div className={styles.description}>
                  {this.renderItemDescription(item)}
                </div>
                <div className={styles.extra}>
                  <IconText type="clock-circle-o" text={showTime(item.created_at || '')} />
                  <IconText key="like" type="like-o" text={get(item, 'target.like_count')} />
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
