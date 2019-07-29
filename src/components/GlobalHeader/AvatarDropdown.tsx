import { Avatar, Icon, Menu } from 'antd';
import { ClickParam } from 'antd/es/menu';
import { FormattedMessage } from 'umi-plugin-react/locale';
import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { parse, stringify } from 'qs';

import { ConnectProps, ConnectState } from '@/models/connect';
import { UserType } from '@/models/user';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';

export function getPageQuery(): {
  [key: string]: string;
} {
  return parse(window.location.href.split('?')[1]);
}

export interface GlobalHeaderRightProps extends ConnectProps {
  currentUser?: UserType;
  menu?: boolean;
}

class AvatarDropdown extends React.Component<GlobalHeaderRightProps> {
  onMenuClick = (event: ClickParam) => {
    const { key } = event;

    if (key === 'logout') {
      const { dispatch } = this.props;
      if (dispatch) {
        dispatch({
          type: 'login/logout',
        });
      }

      return;
    }
    router.push(`/account/${key}`);
  };

  onLoginClick = () => {
    const { redirect } = getPageQuery();
    // redirect
    if (window.location.pathname !== '/auth/login' && !redirect) {
      router.replace({
        pathname: '/auth/login',
        search: stringify({
          redirect: window.location.href,
        }),
      });
    }
  };

  render(): React.ReactNode {
    const { currentUser = {}, menu } = this.props;
    if (!menu) {
      return (
        <span className={`${styles.action} ${styles.account}`}>
          <Avatar
            size="small"
            className={styles.avatar}
            src={currentUser.user_info && currentUser.user_info.avatarUrl}
            alt="avatar"
          />
          <span className={styles.name}>{currentUser.name}</span>
        </span>
      );
    }
    const menuHeaderDropdown = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={this.onMenuClick}>
        <Menu.Item key="center">
          <Icon type="user" />
          <FormattedMessage id="menu.account.center" defaultMessage="account center" />
        </Menu.Item>
        <Menu.Item key="settings">
          <Icon type="setting" />
          <FormattedMessage id="menu.account.settings" defaultMessage="account settings" />
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="logout">
          <Icon type="logout" />
          <FormattedMessage id="menu.account.logout" defaultMessage="logout" />
        </Menu.Item>
      </Menu>
    );

    return currentUser && currentUser.name ? (
      <HeaderDropdown overlay={menuHeaderDropdown}>
        <span className={`${styles.action} ${styles.account}`}>
          <Avatar
            size="small"
            className={styles.avatar}
            src={currentUser.user_info && currentUser.user_info.avatarUrl}
            alt="avatar"
          />
          <span className={styles.name}>{currentUser.name}</span>
        </span>
      </HeaderDropdown>
    ) : (
      <a className={`${styles.action} ${styles.account}`} onClick={this.onLoginClick}>
        <Avatar className={styles.avatar} alt="登录" size="small" />
        <span className={styles.name} style={{ color: 'rgba(0,0,0,.65)' }}>
          账户中心
        </span>
      </a>
    );
  }
}

export default connect(({ user }: ConnectState) => ({
  currentUser: user.currentUser,
}))(AvatarDropdown);
