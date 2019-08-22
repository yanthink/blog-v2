/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */

import ProLayout, {
  MenuDataItem,
  BasicLayoutProps as ProLayoutProps,
  DefaultFooter,
  Settings,
} from '@ant-design/pro-layout';
import React, { useEffect, useState } from 'react';
import { BackTop, Icon } from 'antd';
import Link from 'umi/link';
import NProgress from 'nprogress';
import { connect } from 'dva';
import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import { ConnectState, Dispatch, Loading } from '@/models/connect';
import logo from '../assets/logo.svg';
import 'nprogress/nprogress.css';

export interface BasicLayoutProps extends ProLayoutProps {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
  settings: Settings;
  loading: Loading;
  dispatch: Dispatch;
}

export type BasicLayoutContext = { [K in 'location']: BasicLayoutProps[K] } & {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
};

/**
 * use Authorized check all menu item
 */
const menuDataRender = (menuList: MenuDataItem[]): MenuDataItem[] =>
  menuList.map(item => {
    const localItem = {
      ...item,
      children: item.children ? menuDataRender(item.children) : [],
    };
    return Authorized.check(item.authority, localItem, null) as MenuDataItem;
  });

const footerRender: BasicLayoutProps['footerRender'] = () => {
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
    <DefaultFooter links={links} copyright={copyright} />
  );
};

let lastPathname: string;
let waitLoadingDelay = 200;
let waitLoadingTimeout: any;

const BasicLayout: React.FC<BasicLayoutProps> = props => {
  const { dispatch, children, settings, loading } = props;
  /**
   * constructor
   */

  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'user/fetchCurrent',
      });
      dispatch({
        type: 'settings/getSetting',
      });
    }
    waitLoadingDelay = 80;
  }, []);

  /**
   * init variables
   */
  const handleMenuCollapse = (payload: boolean): void =>
    dispatch &&
    dispatch({
      type: 'global/changeLayoutCollapsed',
      payload,
    });

  const [waitLoadingState, setWaitLoadingState] = useState(false);
  useEffect(() => {
    if (NProgress.isStarted()) {
      if (!loading.global && !waitLoadingState) {
        NProgress.done();
      }
    }
  }, [loading.global, waitLoadingState]);
  const { pathname } = window.location;
  if (lastPathname !== pathname) {
    setWaitLoadingState(true);
    NProgress.start();
    lastPathname = pathname;
    clearTimeout(waitLoadingTimeout);
    waitLoadingTimeout = setTimeout(() => {
      setWaitLoadingState(false);
    }, waitLoadingDelay);
  }

  return (
    <ProLayout
      logo={logo}
      onCollapse={handleMenuCollapse}
      menuItemRender={(menuItemProps, defaultDom) => {
        if (menuItemProps.isUrl) {
          return defaultDom;
        }
        return <Link to={menuItemProps.path}>{defaultDom}</Link>;
      }}
      breadcrumbRender={(routers = []) => [
        {
          path: '/',
          breadcrumbName: '首页',
        },
        ...routers,
      ]}
      footerRender={footerRender}
      menuDataRender={menuDataRender}
      rightContentRender={rightProps => <RightContent {...rightProps} />}
      {...props}
      {...settings}
    >
      {children}
      <BackTop />
    </ProLayout>
  );
};

export default connect(({ global, settings, loading }: ConnectState) => ({
  collapsed: global.collapsed,
  settings,
  loading,
}))(BasicLayout);
