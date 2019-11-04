import React from 'react';
import { Avatar, Icon, Tooltip } from 'antd';
import { Link } from 'umi';
import { get } from 'lodash';
import { INotification } from '@/models/data';
import styles from './style.less';

export interface LikedMyArticleProps {
  notification: INotification;
}

class LikedMyArticle extends React.Component<LikedMyArticleProps> {
  render () {
    const { notification } = this.props;

    return (
      <div className={styles.notification}>
        <div className={styles.avatar}>
          <Avatar src={get(notification, 'data.avatar')} />
        </div>
        <div className={styles.content}>
          <div className={styles.contentHead}>
            <Link to={`/${get(notification, 'data.username')}`}>
              {get(notification, 'data.username')}
            </Link>
            <span> 赞了您的文章 </span>
            <Link to={`/articles/${get(notification, 'data.article_id')}`}>
              {get(notification, 'data.article_title')}
            </Link>
          </div>
          <div className={styles.contentBody}>
          </div>
        </div>
        <div className={styles.timeago}>
          <Tooltip title={notification.created_at}>
            <span>
              <Icon type="clock-circle-o" style={{ marginRight: 4 }} />
              {notification.created_at_timeago}
            </span>
          </Tooltip>
        </div>
      </div>
    );
  }
}

export default LikedMyArticle;
