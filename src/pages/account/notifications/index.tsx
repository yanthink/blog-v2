import React, { useEffect, useState } from 'react';
import { GridContent } from '@ant-design/pro-layout';
import { Menu } from 'antd';
import { BellOutlined, MailOutlined, NotificationOutlined } from '@ant-design/icons';
import { ConnectProps } from '@/models/connect';
import Notifications from './components/Notifications';
import Messages from './components/Messages';
import Systems from './components/Systems';
import styles from './style.less';

interface NoticesProps extends ConnectProps {}

type StateKeysType = 'notifications' | 'messages' | 'systems';

const menuMap: { [key: string]: React.ReactNode } = {
  notifications: (
    <span>
      <BellOutlined />
      通知
    </span>
  ),
  messages: (
    <span>
      <MailOutlined />
      私信
    </span>
  ),
  systems: (
    <span>
      <NotificationOutlined />
      系统
    </span>
  ),
};

const Notices: React.FC<NoticesProps> = () => {
  const [mode, setMode] = useState<'inline' | 'horizontal'>();
  const [selectKey, setSelectKey] = useState<StateKeysType>('notifications');

  function resize() {
    requestAnimationFrame(() => setMode(window.innerWidth < 768 ? 'horizontal' : 'inline'));
  }

  useEffect(() => {
    window.addEventListener('resize', resize);
    resize();
    return () => window.removeEventListener('resize', resize);
  }, []);

  function renderChildren() {
    switch (selectKey) {
      case 'notifications':
        return <Notifications />;
      case 'messages':
        return <Messages />;
      case 'systems':
        return <Systems />;
      default:
        return null;
    }
  }

  return (
    <GridContent>
      <div className={styles.main}>
        <div className={styles.leftMenu}>
          <Menu
            mode={mode}
            selectedKeys={[selectKey]}
            onClick={({ key }) => setSelectKey(key as StateKeysType)}
          >
            {Object.entries(menuMap).map(([key, value]) => (
              <Menu.Item key={key}>{value}</Menu.Item>
            ))}
          </Menu>
        </div>
        <div className={styles.right}>
          <div className={styles.title}>{menuMap[selectKey]}</div>
          {renderChildren()}
        </div>
      </div>
    </GridContent>
  );
};

export default Notices;
