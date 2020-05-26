import React, { useEffect, useState } from 'react';
import { GridContent } from '@ant-design/pro-layout';
import { Menu } from 'antd';
import { ProfileOutlined, MailOutlined, SafetyOutlined } from '@ant-design/icons';
import { ConnectProps } from '@/models/connect';
import BaseView from './components/base';
import NotificationView from './components/notification';
import SecurityView from './components/security';
import styles from './style.less';

interface SettingsProps extends ConnectProps {}

type StateKeysType = 'base' | 'notification' | 'security';

const menuMap: { [key: string]: React.ReactNode } = {
  base: (
    <span>
      <ProfileOutlined />
      基本设置
    </span>
  ),
  notification: (
    <span>
      <MailOutlined />
      通知设置
    </span>
  ),
  security: (
    <span>
      <SafetyOutlined />
      修改密码
    </span>
  ),
};

const Settings: React.FC<SettingsProps> = () => {
  const [mode, setMode] = useState<'inline' | 'horizontal'>();
  const [selectKey, setSelectKey] = useState<StateKeysType>('base');

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
      case 'base':
        return <BaseView />;
      case 'notification':
        return <NotificationView />;
      case 'security':
        return <SecurityView />;
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

export default Settings;
