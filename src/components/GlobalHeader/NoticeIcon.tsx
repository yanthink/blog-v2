import React from 'react';
import { connect } from 'dva';
import { Link } from 'umi';
import { Badge, Icon } from 'antd';
import { ConnectState, AuthStateType } from '@/models/connect';
import styles from './index.less';

export interface NoticeIconProps {
  auth?: AuthStateType;
}

const NoticeIcon: React.FC<NoticeIconProps> = props => {
  const { auth } = props;
  if (auth && auth.user && auth.user.id) {
    return (
      <Link to="/account/notifications" className={`${styles.action} ${styles.noticeBtn}`}>
        <Badge count={auth.unread_count} className={styles.badge}>
          <Icon type="bell" className={styles.icon} />
        </Badge>
      </Link>
    );
  }

  return null;
};

export default connect(({ auth }: ConnectState) => ({
  auth,
}))(NoticeIcon);
