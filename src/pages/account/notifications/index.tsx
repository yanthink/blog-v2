import React from 'react';
import { connect } from 'dva';
import { GridContent } from '@ant-design/pro-layout';
import { Menu, Icon } from 'antd';
import { ConnectState, ConnectProps, Loading, AccountNotificationsModelState } from '@/models/connect';
import { IUser } from '@/models/data';
import Notifications from './components/Notifications';
import Messages from './components/Messages';
import Systems from './components/Systems';
import styles from './style.less';

const MenuItem = Menu.Item;

type NoticeStateKeys = 'notifications' | 'messages' | 'systems';

interface NoticeState {
  mode: 'inline' | 'horizontal';
  menuMap: {
    [key: string]: React.ReactNode;
  };
  selectKey: NoticeStateKeys;
}

interface NoticeProps extends ConnectProps {
  loading: Loading,
  accountNotifications: AccountNotificationsModelState,
  currentUser: IUser,
}

@connect(({ loading, accountNotifications, user }: ConnectState) => ({
  loading,
  accountNotifications,
  currentUser: user.currentUser,
}))
class Notice extends React.Component<NoticeProps, NoticeState> {
  state: NoticeState = {
    mode: 'inline',
    menuMap: {
      notifications: <span><Icon type="bell" />通知</span>,
      messages: <span><Icon type="mail" />私信</span>,
      systems: <span><Icon type="notification" />系统</span>,
    },
    selectKey: 'notifications',
  };

  main: HTMLDivElement | undefined = undefined;

  componentDidMount() {
    window.addEventListener('resize', this.resize);
    this.resize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  setMainRef = (ref: HTMLDivElement) => {
    this.main = ref;
  };

  getMenu = () => {
    const { menuMap } = this.state;
    return Object.keys(menuMap).map(item => <MenuItem key={item}>{menuMap[item]}</MenuItem>);
  };

  getRightTitle = () => {
    const { selectKey, menuMap } = this.state;
    return menuMap[selectKey];
  };

  selectKey = (key: NoticeStateKeys) => {
    this.setState({
      selectKey: key,
    });
  };

  resize = () => {
    if (!this.main) {
      return;
    }
    requestAnimationFrame(() => {
      if (!this.main) {
        return;
      }
      let mode: 'inline' | 'horizontal' = 'inline';
      const { offsetWidth } = this.main;
      if (this.main.offsetWidth < 641 && offsetWidth > 400) {
        mode = 'horizontal';
      }
      if (window.innerWidth < 768 && offsetWidth > 400) {
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
      case 'notifications':
        return <Notifications {...this.props} />;
      case 'messages':
        return <Messages {...this.props} />;
      case 'systems':
        return <Systems {...this.props} />;
      default:
        return null;
    }
  };

  render() {
    const { mode, selectKey } = this.state;
    return (
      <GridContent>
        <div
          className={styles.main}
          ref={this.setMainRef}
        >
          <div className={styles.leftMenu}>
            <Menu
              mode={mode}
              selectedKeys={[selectKey]}
              onClick={({ key }) => this.selectKey(key as NoticeStateKeys)}
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

export default Notice;
