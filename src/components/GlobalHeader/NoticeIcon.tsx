import React from 'react';
import { connect, Link } from 'umi';
import { Badge } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { ConnectState, AuthModelState } from '@/models/connect';
import styles from './index.less';

export interface NoticeIconProps {
  auth: AuthModelState;
}

const NoticeIcon: React.FC<NoticeIconProps> = (props) => {
  const { auth } = props;
  if (auth.logged) {
    return (
      <Link to="/account/notifications" className={`${styles.action} ${styles.noticeBtn}`}>
        <Badge count={auth.unread_count} className={styles.badge}>
          <BellOutlined type="bell" className={styles.icon} />
        </Badge>
      </Link>
    );
  }

  return null;
};

export default connect(({ auth }: ConnectState) => ({
  auth,
}))(NoticeIcon);
