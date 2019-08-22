import React from 'react';
import { connect } from 'dva';
import { Link } from 'umi';
import { Badge, Icon } from 'antd';
import { UserType } from '@/models/user';
import { ConnectState } from '@/models/connect';
import styles from './index.less';

export interface NoticeIconProps {
  currentUser?: UserType;
}

const NoticeIcon: React.FC<NoticeIconProps> = props => {
  const { currentUser } = props;
  if (currentUser && currentUser.name) {
    return (
      <Link to="#" className={`${styles.action} ${styles.noticeBtn}`}>
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
