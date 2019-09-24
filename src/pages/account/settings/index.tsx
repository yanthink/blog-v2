import React, { Component } from 'react';
import { Menu, Icon } from 'antd';
import { GridContent } from '@ant-design/pro-layout';
import { connect } from 'dva';
import { ConnectState, ConnectProps, AccountSettingsModelState, Loading } from '@/models/connect';
import { IUser } from '@/models/data';
import BaseView from './components/base';
import NotificationView from './components/notification';
import SecurityView from './components/security';
import styles from './style.less';

const { Item } = Menu;

interface SettingsProps extends ConnectProps {
  accountSettings: AccountSettingsModelState;
  currentUser: IUser;
  loading: Loading;
}

type SettingsStateKeys = 'base' | 'notification' | 'security';

interface SettingsState {
  mode: 'inline' | 'horizontal';
  menuMap: {
    [key: string]: React.ReactNode;
  };
  selectKey: SettingsStateKeys;
}

@connect(({ accountSettings, user, loading }: ConnectState) => ({
  accountSettings,
  currentUser: user.currentUser,
  loading,
}))
class Settings extends Component<SettingsProps, SettingsState> {
  constructor(props: SettingsProps) {
    super(props);
    const menuMap = {
      base: <span><Icon type="profile" />基本设置</span>,
      notification: <span><Icon type="mail" />通知设置</span>,
      security:  <span><Icon type="safety" />修改密码</span>,
    };
    this.state = {
      mode: 'inline',
      menuMap,
      selectKey: 'base',
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.resize);
    this.resize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  getMenu = () => {
    const { menuMap } = this.state;
    return Object.keys(menuMap).map(item => <Item key={item}>{menuMap[item]}</Item>);
  };

  getRightTitle = () => {
    const { selectKey, menuMap } = this.state;
    return menuMap[selectKey];
  };

  selectKey = (key: SettingsStateKeys) => {
    this.setState({
      selectKey: key,
    });
  };

  resize = () => {
    requestAnimationFrame(() => {
      let mode: 'inline' | 'horizontal' = 'inline';
      if (window.innerWidth < 768) {
        mode = 'horizontal';
      }
      this.setState({
        mode,
      });
    });
  };

  renderChildren = () => {
    const { selectKey } = this.state;
    switch (selectKey) {
      case 'base':
        return <BaseView {...this.props} />;
      case 'notification':
        return <NotificationView {...this.props} />
      case 'security':
        return <SecurityView {...this.props} />;
      default:
        break;
    }

    return null;
  };

  render() {
    const { currentUser } = this.props;
    if (!currentUser.id) {
      return '';
    }
    const { mode, selectKey } = this.state;
    return (
      <GridContent>
        <div className={styles.main}>
          <div className={styles.leftMenu}>
            <Menu
              mode={mode}
              selectedKeys={[selectKey]}
              onClick={({ key }) => this.selectKey(key as SettingsStateKeys)}
            >
              {this.getMenu()}
            </Menu>
          </div>
          <div className={styles.right}>
            <div className={styles.title}>{this.getRightTitle()}</div>
            {this.renderChildren()}
          </div>
        </div>
      </GridContent>
    );
  }
}

export default Settings;
