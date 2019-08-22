import { Avatar, Icon, Menu } from 'antd';
import { ClickParam } from 'antd/es/menu';
import React from 'react';
import { connect } from 'dva';
import { router } from 'umi';
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
    const { currentUser = {} } = this.props;
    const menuHeaderDropdown = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={this.onMenuClick}>
        <Menu.Item key="center">
          <Icon type="user" />
          <span>个人中心</span>
        </Menu.Item>
        <Menu.Item key="settings">
          <Icon type="setting" />
          <span>个人设置</span>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="logout">
          <Icon type="logout" />
          <span>退出登录</span>
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
        <Avatar className={styles.avatar} icon="user" alt="登录" size="small" />
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
