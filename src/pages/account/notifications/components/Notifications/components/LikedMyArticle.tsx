import React from 'react';
import { Link } from 'umi';
import { Avatar, Tooltip } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { INotification } from '@/models/I';
import styles from './style.less';

interface LikedMyArticleProps {
  notification: INotification;
}

const LikedMyArticle: React.FC<LikedMyArticleProps> = ({ notification }) => {
  return (
    <div className={styles.notification}>
      <div className={styles.avatar}>
        <Avatar src={notification.data?.avatar} />
      </div>
      <div className={styles.content}>
        <div className={styles.contentHead}>
          <Link to={`/${notification.data.username}`}>{notification.data.username}</Link>
          <span> 赞了您的文章 </span>
          <Link to={`/articles/${notification.data.article_id}`}>
            {notification.data.article_title}
          </Link>
        </div>
        <div className={styles.contentBody} />
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

export default LikedMyArticle;
