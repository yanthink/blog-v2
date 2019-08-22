import { DefaultFooter, MenuDataItem, getMenuData, getPageTitle } from '@ant-design/pro-layout';
import DocumentTitle from 'react-document-title';
import React from 'react';
import { connect } from 'dva';
import { Icon } from 'antd';
import { ConnectProps, ConnectState } from '@/models/connect';
import styles from './AuthLayout.less';

export interface AuthLayoutProps extends ConnectProps {
  breadcrumbNameMap: { [path: string]: MenuDataItem };
}

const AuthLayout: React.FC<AuthLayoutProps> = props => {
  const {
    route = {
      routes: [],
    },
  } = props;
  const { routes = [] } = route;
  const {
    children,
    location = {
      pathname: '',
    },
  } = props;
  const { breadcrumb } = getMenuData(routes);

  const links = [
    {
      key: 'Ant Design Pro',
      title: 'Ant Design Pro',
      href: 'https://pro.ant.design',
      blankTarget: true,
    },
    {
      key: 'github',
      title: <Icon type="github" />,
      href: 'https://github.com/yanthink/blog-v2',
      blankTarget: true,
    },
    {
      key: 'Ant Design',
      title: 'Ant Design',
      href: 'https://ant.design',
      blankTarget: true,
    },
  ];

  const copyright = '2019 平凡的博客 粤ICP备18080782号-1';

  return (
    <DocumentTitle
      title={getPageTitle({
        pathname: location.pathname,
        breadcrumb,
        ...props,
      })}
    >
      <div className={styles.container}>
        <div className={styles.lang}>
          <a
            href="https://github.com/yanthink/blog-v2"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Icon type="github" className={styles.github} />
          </a>
        </div>
        <div className={styles.content}>{children}</div>
        <DefaultFooter links={links} copyright={copyright} />
      </div>
    </DocumentTitle>
  );
};

export default connect(({ settings }: ConnectState) => ({
  ...settings,
}))(AuthLayout);
