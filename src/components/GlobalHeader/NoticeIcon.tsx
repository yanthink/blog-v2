import React from 'react';
import { connect } from 'dva';
import { Link } from 'umi';
import { Badge, Icon } from 'antd';
import { IUser } from '@/models/data';
import { ConnectState } from '@/models/connect';
import styles from './index.less';

export interface NoticeIconProps {
  currentUser?: IUser;
}

const NoticeIcon: React.FC<NoticeIconProps> = props => {
  const { currentUser } = props;
  if (currentUser && currentUser.name) {
    return (
      <Link to="/account/notice" className={`${styles.action} ${styles.noticeBtn}`}>
        <Badge count={currentUser.unread_count} className={styles.badge}>
          <Icon type="bell" className={styles.icon} />
        </Badge>
      </Link>
    );
  }

  return null;
};

export default connect(({ user }: ConnectState) => ({
  currentUser: user.currentUser,
}))(NoticeIcon);
