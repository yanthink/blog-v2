import React from 'react';
import { Link } from 'umi';
import { Avatar, Tooltip } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import MarkdownBody from '@/components/MarkdownBody';
import { INotification } from '@/models/I';
import styles from './style.less';

interface MentionedMeProps {
  notification: INotification;
}

const MentionedMe: React.FC<MentionedMeProps> = ({ notification }) => {
  function renderContentHead() {
    switch (notification.data.contentable_type) {
      case 'App\\Models\\Article':
        return (
          <>
            <Link to={`/${notification.data.username}`}>{notification.data.username}</Link>
            <span> 在 </span>
            <Link to={`/articles/${notification.data.contentable_id}`}>
              {notification.data.contentable_title}
            </Link>
            <span> 文章中提及了您</span>
          </>
        );
      case 'App\\Models\\Comment':
        // eslint-disable-next-line no-case-declarations
        const pathname = `/articles/${notification.data.commentable_id}`;
        // eslint-disable-next-line no-case-declarations
        const hash = `#comment-${notification.data.comment_id}`;

        return (
          <>
            <Link to={`/${notification.data.username}`}>{notification.data.username}</Link>
            <span> 在 </span>
            <Link to={`${pathname}${hash}`}>{notification.data.commentable_title}</Link>
            <span> 的评论中提及了您 </span>
          </>
        );
      default:
        return null;
    }
  }

  return (
    <div className={styles.notification}>
      <div className={styles.avatar}>
        <Avatar src={notification.data.avatar} />
      </div>
      <div className={styles.content}>
        <div className={styles.contentHead}>{renderContentHead()}</div>
        <div className={styles.contentBody}>
          <MarkdownBody markdown={notification.data.content} />
        </div>
      </div>
      <div className={styles.timeago}>
        <Tooltip title={notification.created_at}>
          <span>
            <ClockCircleOutlined style={{ marginRight: 4 }} />
            {notification.created_at_timeago}
          </span>
        </Tooltip>
      </div>
    </div>
  );
};

export default MentionedMe;
