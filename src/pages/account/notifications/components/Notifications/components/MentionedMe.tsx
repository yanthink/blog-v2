import React from 'react';
import { Avatar, Icon, Tooltip } from 'antd';
import { Link } from 'umi';
import { get } from 'lodash';
import { INotification } from '@/models/data';
import MarkdownBody from '@/components/MarkdownBody';
import styles from './style.less';

export interface MentionedMeProps {
  notification: INotification;
}

class MentionedMe extends React.Component<MentionedMeProps> {
  renderContentHead = () => {
    const { notification } = this.props;

    switch (get(notification, 'data.contentable_type')) {
      case 'App\\Models\\Article':
        return (
          <>
            <Link to={`/${get(notification, 'data.username')}`}>
              {get(notification, 'data.username')}
            </Link>
            <span> 在 </span>
            <Link to={`/articles/${get(notification, 'data.contentable_id')}`}>
              {get(notification, 'data.contentable_title')}
            </Link>
            <span> 文章中提及了您</span>
          </>
        );
      case 'App\\Models\\Comment':
        const pathname = `/articles/${get(notification, 'data.commentable_id')}`;
        const hash = `#comment-${get(notification, 'data.comment_id')}`;

        return (
          <>
            <Link to={`/${get(notification, 'data.username')}`}>
              {get(notification, 'data.username')}
            </Link>
            <span> 在 </span>
            <Link to={`${pathname}${hash}`}>
              {get(notification, 'data.commentable_title')}
            </Link>
            <span> 的评论中提及了您 </span>
          </>
        );
      default:
        return null;
    }
  };

  render () {
    const { notification } = this.props;

    return (
      <div className={styles.notification}>
        <div className={styles.avatar}>
          <Avatar src={get(notification, 'data.avatar')} />
        </div>
        <div className={styles.content}>
          <div className={styles.contentHead}>
            {this.renderContentHead()}
          </div>
          <div className={styles.contentBody}>
            <MarkdownBody markdown={get(notification, 'data.content')} />
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

export default MentionedMe;
