import React from 'react';
import { connect } from 'dva';
import { List, Avatar, Icon, Tooltip, Card } from 'antd';
import { Link } from 'umi';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { parse, stringify } from 'qs';
import { get } from 'lodash';
import marked from 'marked';
import Prism from 'prismjs';
// @ts-ignore
import emojiToolkit from 'emoji-toolkit';
import moment from 'moment';
import { ConnectProps, ConnectState, NotificationListModelState } from '@/models/connect';
import { INotification } from '@/models/data';
import styles from './style.less';

const defaultQueryParams = {
  include: 'notifiable',
};

interface NotificationListProps extends ConnectProps {
  notificationList: NotificationListModelState;
  loading: boolean;
}

@connect(({ loading, notificationList }: ConnectState) => ({
  notificationList,
  loading: loading.effects['notificationList/fetch'],
}))
class NotificationList extends React.Component<NotificationListProps> {
  markdown: HTMLDivElement | undefined = undefined;

  componentWillMount() {
    this.queryList(this.props.location.search);
  }

  componentDidMount() {
    if (this.markdown) {
      Prism.highlightAllUnder(this.markdown);
    }
  }

  componentWillReceiveProps(nextProps: Readonly<NotificationListProps>): void {
    if (nextProps.location.search !== this.props.location.search) {
      this.queryList(nextProps.location.search);
    }
  }

  componentDidUpdate() {
    if (this.markdown) {
      Prism.highlightAllUnder(this.markdown);
    }
  }

  queryList = (params: object | string) => {
    const query = params instanceof Object ? params : parse(params.replace(/^\?/, ''));

    const queryParams = {
      ...defaultQueryParams,
      ...query,
    };

    this.props.dispatch({
      type: 'notificationList/fetch',
      payload: queryParams,
    });
  };

  setMarkdownRef = (ref: any) => {
    this.markdown = ref;
  };

  renderItemTitle = (notification: INotification) => {
    const typeToTitleMap = {
      'App\\Notifications\\CommentArticle': ['评论', '文章'],
      'App\\Notifications\\ReplyComment': ['回复', '评论'],
      'App\\Notifications\\LikeArticle': ['赞', '文章'],
      'App\\Notifications\\LikeComment': ['赞', '评论'],
      'App\\Notifications\\LikeReply': ['赞', '回复'],
    };

    return (
      <span>
        <Link to="#">{get(notification, 'data.form_user_name')}</Link>
        <span> • </span>
        <span>
          {get(typeToTitleMap, notification.type as string, [])[0]}了
        </span>
        <span> </span>
        <Link to="#">
          {get(notification, 'notifiable.name')}
        </Link>
        <span> 的{get(typeToTitleMap, notification.type as string, [])[1]} </span>
        <Link
          to={`/articles/${get(notification, 'data.target_root_id')}/show`}
        >
          {get(notification, 'data.target_root_title')}
        </Link>
      </span>
    );
  };

  renderItemContent = (notification: INotification) => {
    switch (notification.type) {
      case 'App\\Notifications\\CommentArticle':
        return (
          <span
            dangerouslySetInnerHTML={{
              __html: emojiToolkit.toImage(marked(get(notification, 'data.content'))),
            }}
          />
        );
      case 'App\\Notifications\\ReplyComment':
        return (
          <div>
            <span
              dangerouslySetInnerHTML={{
                __html: emojiToolkit.toImage(marked(get(notification, 'data.content'))),
              }}
            />
            <span> // </span>
            <Link to="#">@{get(notification, 'notifiable.name')}</Link>
            <span>：</span>
            <span
              dangerouslySetInnerHTML={{
                __html: emojiToolkit.toImage(
                  marked(get(notification, 'data.target_name')),
                ),
              }}
            />
          </div>
        );
      case 'App\\Notifications\\LikeArticle':
        return null;
      case 'App\\Notifications\\LikeComment':
      case 'App\\Notifications\\LikeReply':
        return (
          <span
            dangerouslySetInnerHTML={{
              __html: emojiToolkit.toImage(marked(get(notification, 'data.target_name'))),
            }}
          />
        );
      default:
        return null;
    }
  };

  render() {
    const {
      notificationList: { list, pagination },
      loading,
      location: { pathname, search },
    } = this.props;

    const query = parse(search.replace(/^\?/, ''));

    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div ref={this.setMarkdownRef} className="markdown-body">
            <List
              size="large"
              rowKey="id"
              itemLayout="vertical"
              loading={loading}
              dataSource={list}
              pagination={{
                ...pagination,
                simple: window.innerWidth < 768,
                itemRender(page, type, originalElement) {
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
                    <div className={styles.content}>
                      {this.renderItemContent(item)}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default NotificationList;
