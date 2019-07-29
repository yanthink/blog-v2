import React from 'react';
import { connect } from 'dva';
import { router } from 'umi';
import { formatMessage } from 'umi-plugin-react/locale';
import { ConnectProps, ConnectState } from '@/models/connect';

import Avatar from './AvatarDropdown';
import HeaderSearch from '../HeaderSearch';
import SelectLang from '../SelectLang';
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
      <span style={{ width: 80, height: 1, display: 'inline-block' }} />
      <HeaderSearch
        className={`${styles.action} ${styles.search}`}
        placeholder={formatMessage({
          id: 'component.globalHeader.search',
        })}
        dataSource={[]}
        onSearch={() => {}}
        onPressEnter={value => {
          router.push({
            pathname: '/articles/list',
            query: {
              keyword: value,
            },
          });
        }}
      />
      <Avatar menu />
      <SelectLang className={styles.action} />
    </div>
  );
};

export default connect(({ settings }: ConnectState) => ({
  theme: settings.navTheme,
  layout: settings.layout,
}))(GlobalHeaderRight);
