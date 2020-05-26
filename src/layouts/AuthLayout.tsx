import React from 'react';
import { getMenuData, getPageTitle, DefaultFooter } from '@ant-design/pro-layout';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { connect } from 'umi';
import { GithubOutlined } from '@ant-design/icons';
import { ConnectProps, ConnectState } from '@/models/connect';
import styles from './AuthLayout.less';

interface AuthLayoutProps extends ConnectProps {}

const AuthLayout: React.FC<AuthLayoutProps> = (props) => {
  const { route = { routes: [] } } = props;
  const { routes = [] } = route;
  const { children, location = { pathname: '' } } = props;
  const { breadcrumb } = getMenuData(routes);

  const title = getPageTitle({
    pathname: location.pathname,
    breadcrumb,
    ...props,
  });

  const links = [
    {
      key: 'Ant Design Pro',
      title: 'Ant Design Pro',
      href: 'https://pro.ant.design',
      blankTarget: true,
    },
    {
      key: 'github',
      title: <GithubOutlined />,
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
    <HelmetProvider>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={title} />
      </Helmet>

      <div className={styles.container}>
        <div className={styles.content}>{children}</div>
        <DefaultFooter links={links} copyright={copyright} />
      </div>
    </HelmetProvider>
  );
};

export default connect(({ settings }: ConnectState) => ({
  ...settings,
}))(AuthLayout);
