import { Avatar, Icon, Menu } from 'antd';
import { ClickParam } from 'antd/es/menu';
import React from 'react';
import { connect } from 'dva';
import { router } from 'umi';
import { stringify } from 'qs';
import { ConnectProps, ConnectState, AuthStateType } from '@/models/connect';
import { getPageQuery } from '@/utils/utils';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';

export interface GlobalHeaderRightProps extends ConnectProps {
  auth?: AuthStateType;
}

class AvatarDropdown extends React.Component<GlobalHeaderRightProps> {
  onMenuClick = (event: ClickParam) => {
    const { key } = event;

    if (key === 'logout') {
      const { dispatch } = this.props;
      if (dispatch) {
        dispatch({
          type: 'auth/logout',
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
      router.push({
        pathname: '/auth/login',
        search: stringify({
          redirect: window.location.href,
        }),
      });
    }
  };

  render (): React.ReactNode {
    const { auth } = this.props;
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

    return auth && auth.user && auth.user.id ? (
      <HeaderDropdown overlay={menuHeaderDropdown}>
        <span className={`${styles.action} ${styles.account}`}>
          <Avatar
            size="small"
            className={styles.avatar}
            src={auth.user.avatar}
            alt="avatar"
          />
          <span className={styles.name}>{auth.user.username}</span>
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

export default connect(({ auth }: ConnectState) => ({
  auth,
}))(AvatarDropdown);
