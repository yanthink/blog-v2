import React from 'react';
import { List } from 'antd';
import { connect } from 'dva';
import { parse } from 'qs';
import { ConnectProps, Loading, AccountNotificationsModelState, ConnectState } from '@/models/connect';
import { INotification } from '@/models/data';
import CommentMyArticle from './components/CommentMyArticle';
import LikedMyArticle from './components/LikedMyArticle';
import MentionedMe from './components/MentionedMe';
import ReplyMyComment from './components/ReplyMyComment';
import UpVotedMyComment from './components/UpVotedMyComment';
import styles from './index.less';

const defaultQueryParams = {};

interface NotificationsProps extends ConnectProps {
  loading: Loading;
  accountNotifications: AccountNotificationsModelState;

  [key: string]: any;
}

@connect(({ auth }: ConnectState) => ({
  auth,
}))
class Notifications extends React.Component<NotificationsProps> {
  UNSAFE_componentWillMount () {
    this.queryNotifications(this.props.location.search);
  }

  queryNotifications = (params: object | string) => {
    const query = params instanceof Object ? params : parse(params.replace(/^\?/, ''));

    const queryParams = {
      ...defaultQueryParams,
      ...query,
    };

    this.props.dispatch({
      type: 'accountNotifications/fetchNotifications',
      payload: queryParams,
    });
  };

  handlePageChange = (page: number, pageSize?: number) => {
    const { location: { search } } = this.props;
    const query = parse(search.replace(/^\?/, ''));
    this.queryNotifications({ ...query, page, pageSize });
  };

  renderNotification = (notification: INotification) => {
    switch (notification.type) {
      case 'App\\Notifications\\CommentMyArticle':
        return <CommentMyArticle notification={notification} />;
      case 'App\\Notifications\\LikedMyArticle':
        return <LikedMyArticle notification={notification} />;
      case 'App\\Notifications\\MentionedMe':
        return <MentionedMe notification={notification} />;
      case 'App\\Notifications\\ReplyMyComment':
        return <ReplyMyComment notification={notification} />;
      case 'App\\Notifications\\UpVotedMyComment':
        return <UpVotedMyComment notification={notification} />;
      default:
        return null;
    }
  };

  render () {
    const {
      loading,
      accountNotifications: { notifications: { list, meta } },
    } = this.props;

    return (
      <List
        size="large"
        rowKey="id"
        itemLayout="vertical"
        loading={loading.effects['accountNotifications/fetchNotifications']}
        dataSource={list}
        pagination={{
          total: meta.total,
          current: meta.current_page,
          pageSize: meta.per_page || 10,
          simple: window.innerWidth < 768,
          onChange: this.handlePageChange,
        }}
        renderItem={(item: INotification) => (
          <List.Item key={item.id} className={item.read_at ? '' : styles.unread}>
            {this.renderNotification(item)}
          </List.Item>
        )}
      />
    );
  }
}

export default Notifications;
