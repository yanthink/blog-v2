import React, { useEffect } from 'react';
import { connect, history, useRequest } from 'umi';
import { GithubOutlined } from '@ant-design/icons';
import { ConnectState, ConnectProps } from '@/models/connect';
import { ResponseResultType } from '@/models/I';
import * as services from '@/services';
import NoticeIcon from './NoticeIcon';
import Avatar from './AvatarDropdown';
import HeaderSearch from '../HeaderSearch';
import styles from './index.less';

export type SiderTheme = 'light' | 'dark' | 'realDark';

export interface GlobalHeaderRightProps extends Partial<ConnectProps> {
  theme?: SiderTheme;
  layout: 'sidemenu' | 'topmenu';
}

const GlobalHeaderRight: React.FC<GlobalHeaderRightProps> = (props) => {
  const { data: keywords = [], run: getHotKeywords } = useRequest<ResponseResultType<string[]>>(
    services.getHotKeywords,
    {
      manual: true,
      throttleInterval: 3600000,
    },
  );

  useEffect(() => {
    getHotKeywords();
  }, []);

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
        onVisibleChange={(b) => b && getHotKeywords()}
        onSearch={(value) => {
          history.push({
            pathname: '/articles/list',
            query: {
              q: value,
            },
          });
        }}
        options={keywords.map((keyword) => ({ label: keyword, value: keyword }))}
      />
      <NoticeIcon />
      <Avatar />
      <a
        className={styles.action}
        href="https://github.com/yanthink/blog-v2"
        rel="noopener noreferrer"
        target="_blank"
      >
        <GithubOutlined className={styles.github} />
      </a>
    </div>
  );
};

export default connect(({ settings }: ConnectState) => ({
  theme: settings.navTheme,
  layout: settings.layout,
}))(GlobalHeaderRight);
