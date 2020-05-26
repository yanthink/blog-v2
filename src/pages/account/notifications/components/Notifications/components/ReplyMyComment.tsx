import React from 'react';
import { connect, Link } from 'umi';
import { Avatar, Tooltip } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import MarkdownBody from '@/components/MarkdownBody';
import { ConnectProps, ConnectState, AuthModelState } from '@/models/connect';
import { INotification } from '@/models/I';
import styles from './style.less';

interface ReplyMyCommentProps extends Partial<ConnectProps> {
  notification: INotification;
  auth?: AuthModelState;
}

const ReplyMyComment: React.FC<ReplyMyCommentProps> = ({ notification, auth }) => {
  function getLink() {
    const pathname = `/articles/${notification.data.commentable_id}`;
    const hash = `#comment-${notification.data.comment_id}`;

    return `${pathname}${hash}`;
  }

  function getCombineMarkdown() {
    return `${notification.data.content} //@${auth?.user.username}：${notification.data.parent_content}`;
  }

  return (
    <div className={styles.notification}>
      <div className={styles.avatar}>
        <Avatar src={notification.data.avatar} />
      </div>
      <div className={styles.content}>
        <div className={styles.contentHead}>
          <Link to={`/${notification.data.username}`}>{notification.data.username}</Link>
          <span> 回复了您的评论 </span>
          <Link to={getLink()}>{notification.data.commentable_title}</Link>
        </div>
        <div className={styles.contentBody}>
          <MarkdownBody markdown={getCombineMarkdown()} />
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

export default connect(({ auth }: ConnectState) => ({ auth }))(ReplyMyComment);
