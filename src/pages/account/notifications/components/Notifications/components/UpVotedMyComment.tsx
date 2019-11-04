import React from 'react';
import { Avatar, Icon, Tooltip } from 'antd';
import { Link } from 'umi';
import { get } from 'lodash';
import { INotification } from '@/models/data';
import MarkdownBody from '@/components/MarkdownBody';
import styles from './style.less';

export interface UpVotedMyCommentProps {
  notification: INotification;
}

class UpVotedMyComment extends React.Component<UpVotedMyCommentProps> {
  getLink = () => {
    const { notification } = this.props;
    const pathname = `/articles/${get(notification, 'data.commentable_id')}`;
    const hash = `#comment-${get(notification, 'data.comment_id')}`;

    return `${pathname}${hash}`;
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
            <Link to={`/${get(notification, 'data.username')}`}>
              {get(notification, 'data.username')}
            </Link>
            <span> 赞了您的评论 </span>
            <Link to={this.getLink()}>
              {get(notification, 'data.commentable_title')}
            </Link>
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

export default UpVotedMyComment;
