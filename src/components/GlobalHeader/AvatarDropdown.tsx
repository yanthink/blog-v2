import React from 'react';
import { history, connect } from 'umi';
import { Avatar, Menu } from 'antd';
import { BugOutlined, UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { stringify } from 'qs';
import { ClickParam } from 'antd/es/menu';
import { getToken } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';
import { ConnectState, ConnectProps, AuthModelState } from '@/models/connect';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';

export interface GlobalHeaderRightProps extends Partial<ConnectProps> {
  auth: AuthModelState;
}

class AvatarDropdown extends React.Component<GlobalHeaderRightProps> {
  onMenuClick = (event: ClickParam) => {
    const { key } = event;
    const { dispatch } = this.props;
    if (!dispatch) return;

    switch (key) {
      case 'logout':
        return dispatch({
          type: 'auth/logout',
        });
      case 'telescope':
        window.open(`/api/web/login?_token=${getToken()}`);
        return;
      default:
        break;
    }

    history.push(`/account/${key}`);
  };

  onLoginClick = () => {
    const { redirect } = getPageQuery();
    // redirect
    if (window.location.pathname !== '/auth/login' && !redirect) {
      history.push({
        pathname: '/auth/login',
        search: stringify({
          redirect: window.location.href,
        }),
      });
    }
  };

  render() {
    const { auth } = this.props;

    const menuHeaderDropdown = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={this.onMenuClick}>
        {auth && auth.user.id === 1 && (
          <Menu.Item key="telescope">
            <BugOutlined />
            <span>调试工具</span>
          </Menu.Item>
        )}
        <Menu.Item key="center">
          <UserOutlined />
          <span>个人中心</span>
        </Menu.Item>
        <Menu.Item key="settings">
          <SettingOutlined />
          <span>个人设置</span>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="logout">
          <LogoutOutlined />
          <span>退出登录</span>
        </Menu.Item>
      </Menu>
    );

    return auth.logged ? (
      <HeaderDropdown overlay={menuHeaderDropdown}>
        <span className={`${styles.action} ${styles.account}`}>
          <Avatar size="small" className={styles.avatar} src={auth.user.avatar} alt="avatar" />
          <span className={styles.name}>{auth.user.username}</span>
        </span>
      </HeaderDropdown>
    ) : (
      <a className={`${styles.action} ${styles.account}`} onClick={this.onLoginClick}>
        <Avatar className={styles.avatar} icon={<UserOutlined />} alt="登录" size="small" />
        <span className={styles.name} style={{ color: 'rgba(0, 0, 0, .65)' }}>
          账户中心
        </span>
      </a>
    );
  }
}

export default connect(({ auth }: ConnectState) => ({
  auth,
}))(AvatarDropdown);
