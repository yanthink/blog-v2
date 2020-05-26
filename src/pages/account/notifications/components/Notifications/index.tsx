import React from 'react';
import { useRequest } from 'umi';
import { List } from 'antd';
import { umiformatPaginationResult } from '@/utils/utils';
import { INotification, ResponseResultType } from '@/models/I';
import CommentMyArticle from './components/CommentMyArticle';
import LikedMyArticle from './components/LikedMyArticle';
import MentionedMe from './components/MentionedMe';
import ReplyMyComment from './components/ReplyMyComment';
import UpVotedMyComment from './components/UpVotedMyComment';
import * as service from '../../services';
import styles from './style.less';

interface NotificationsProps {}

const Notifications: React.FC<NotificationsProps> = () => {
  const { loading, data, pagination } = useRequest<
    ResponseResultType<INotification[]>,
    INotification
  >(({ current, pageSize }) => service.queryNotifications({ page: current, per_page: pageSize }), {
    paginated: true,
    formatResult: umiformatPaginationResult,
  });

  function renderNotification(notification: INotification) {
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
      renderItem={(item: INotification) => (
        <List.Item key={item.id} className={item.read_at ? '' : styles.unread}>
          {renderNotification(item)}
        </List.Item>
      )}
    />
  );
};

export default Notifications;
