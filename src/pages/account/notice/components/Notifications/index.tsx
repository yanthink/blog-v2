import React from 'react';
import { List, Avatar, Tooltip, Icon } from 'antd';
import { Link } from 'umi';
import { get } from 'lodash';
import { parse } from 'qs';
import marked from 'marked';
// @ts-ignore
import emojiToolkit from 'emoji-toolkit';
import Prism from 'prismjs';
import moment from 'moment';
import { ConnectProps, Loading, AccountNoticeModelState } from '@/models/connect';
import { INotification } from '@/models/data';
import styles from './index.less';

const defaultQueryParams = {};

interface NotificationsProps extends ConnectProps {
  loading: Loading;
  accountNotice: AccountNoticeModelState;

  [key: string]: any;
}

class Notifications extends React.Component<NotificationsProps> {
  markdown: HTMLDivElement | undefined = undefined;

  componentWillMount() {
    this.queryNotifications(this.props.location.search);
  }

  componentDidMount() {
    if (this.markdown) {
      Prism.highlightAllUnder(this.markdown);
    }
  }

  componentDidUpdate() {
    if (this.markdown) {
      Prism.highlightAllUnder(this.markdown);
    }
  }

  queryNotifications = (params: object | string) => {
    const query = params instanceof Object ? params : parse(params.replace(/^\?/, ''));

    const queryParams = {
      ...defaultQueryParams,
      ...query,
    };

    this.props.dispatch({
      type: 'accountNotice/fetchNotifications',
      payload: queryParams,
    });
  };

  setMarkdownRef = (ref: any) => {
    this.markdown = ref;
  };

  handlePageChange = (page: number, pageSize?: number) => {
    const { location: { search } } = this.props;
    const query = parse(search.replace(/^\?/, ''));
    this.queryNotifications({ ...query, page, pageSize });
  };

  renderItemTitle = (notification: INotification) => {
    const typeToTitleMap = {
      'App\\Notifications\\CommentArticle': '评论了你的文章',
      'App\\Notifications\\ReplyComment': '回复了你的评论',
      'App\\Notifications\\LikeArticle': '赞了你的文章',
      'App\\Notifications\\LikeComment': '赞了你的评论',
      'App\\Notifications\\LikeReply': '赞了你的回复',
    };

    return (
      <span>
        <Link to="#">{get(notification, 'data.form_user_name')}</Link>
        <span> • {get(typeToTitleMap, notification.type as string)} </span>
        <Link
          to={`/articles/${get(notification, 'data.target_root_id')}/show?notification_id=${notification.id}`}
        >
          {get(notification, 'data.target_root_title')}
        </Link>
      </span>
    );
  };

  render() {
    const {
      loading,
      accountNotice: { notifications: { list, pagination } },
    } = this.props;

    return (
      <List
        size="large"
        rowKey="id"
        itemLayout="vertical"
        loading={loading.effects['accountNotice/fetchNotifications']}
        dataSource={list}
        pagination={{
          ...pagination,
          onChange: this.handlePageChange,
        }}
        renderItem={(item: INotification) => (
          <List.Item
            key={item.id}
          >
            <div className={item.read_at ? styles.read : ''}>
              <div className={styles.top}>
                <div className={styles.avatar}>
                  <Avatar src={get(item, 'data.form_user_avatar')} />
                </div>
                <div className={styles.topContent}>
                  {this.renderItemTitle(item)}
                </div>
                <div className={styles.topTime}>
                  <Tooltip title={item.created_at}>
                  <span>
                    <Icon type="clock-circle-o" style={{ marginRight: 4 }} />
                    {moment(item.created_at).fromNow()}
                  </span>
                  </Tooltip>
                </div>
              </div>
              <div ref={this.setMarkdownRef} className={`${styles.content} markdown-body`}>
                <span
                  dangerouslySetInnerHTML={{
                    __html: emojiToolkit.toImage(marked(get(item, 'data.content'))),
                  }}
                />
              </div>
            </div>
          </List.Item>
        )}
      />
    );
  }
}

export default Notifications;
