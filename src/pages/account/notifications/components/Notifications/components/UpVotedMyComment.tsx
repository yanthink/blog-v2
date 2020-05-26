import React from 'react';
import { Link } from 'umi';
import { Avatar, Tooltip } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import MarkdownBody from '@/components/MarkdownBody';
import { INotification } from '@/models/I';
import styles from './style.less';

interface UpVotedMyCommentProps {
  notification: INotification;
}

const UpVotedMyComment: React.FC<UpVotedMyCommentProps> = ({ notification }) => {
  function getLink() {
    const pathname = `/articles/${notification.data.commentable_id}`;
    const hash = `#comment-${notification.data.comment_id}`;

    return `${pathname}${hash}`;
  }

  return (
    <div className={styles.notification}>
      <div className={styles.avatar}>
        <Avatar src={notification.data.avatar} />
      </div>
      <div className={styles.content}>
        <div className={styles.contentHead}>
          <Link to={`/${notification.data.username}`}>{notification.data.username}</Link>
          <span> 赞了您的评论 </span>
          <Link to={getLink()}>{notification.data.commentable_title}</Link>
        </div>
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

export default UpVotedMyComment;
