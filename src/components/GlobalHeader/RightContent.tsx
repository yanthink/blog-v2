import React from 'react';
import { connect } from 'dva';
import { router } from 'umi';
import { Icon } from 'antd';
import { ConnectProps, ConnectState } from '@/models/connect';

import NoticeIcon from './NoticeIcon';
import Avatar from './AvatarDropdown';
import HeaderSearch from '../HeaderSearch';
import styles from './index.less';

export type SiderTheme = 'light' | 'dark';

export interface GlobalHeaderRightProps extends ConnectProps {
  theme?: SiderTheme;
  layout: 'sidemenu' | 'topmenu';
}

const GlobalHeaderRight: React.FC<GlobalHeaderRightProps> = props => {
  const { theme, layout } = props;
  let className = styles.right;

  if (theme === 'dark' && layout === 'topmenu') {
    className = `${styles.right}  ${styles.dark}`;
  }

  return (
    <div className={className}>
      <HeaderSearch
        className={`${styles.action} ${styles.search}`}
        placeholder="站内搜索"
        dataSource={[]}
        onSearch={() => {
        }}
        onPressEnter={value => {
          router.push({
            pathname: '/articles/list',
            query: {
              q: value,
            },
          });
        }}
      />
      <NoticeIcon />
      <Avatar />
      <a
        className={styles.action}
        href="https://github.com/yanthink/blog-v2"
        rel="noopener noreferrer"
        target="_blank"
      >
        <Icon type="github" className={styles.github} />
      </a>
    </div>
  );
};

export default connect(({ settings }: ConnectState) => ({
  theme: settings.navTheme,
  layout: settings.layout,
}))(GlobalHeaderRight);
