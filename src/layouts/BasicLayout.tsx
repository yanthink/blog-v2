/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */

import ProLayout, {
  MenuDataItem,
  BasicLayoutProps as ProLayoutProps,
  Settings,
} from '@ant-design/pro-layout';
import React, { useEffect, useState } from 'react';
import { BackTop } from 'antd';
import Link from 'umi/link';
import NProgress from 'nprogress';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-react/locale';
import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import { ConnectState, Dispatch, Loading } from '@/models/connect';
import { isAntDesignPro } from '@/utils/utils';
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

const footerRender: BasicLayoutProps['footerRender'] = (_, defaultDom) => {
  if (!isAntDesignPro()) {
    return defaultDom;
  }
  return (
    <>
      {defaultDom}
      <div
        style={{
          padding: '0px 24px 24px',
          textAlign: 'center',
        }}
      >
        <a href="https://www.netlify.com" target="_blank" rel="noopener noreferrer">
          <img
            src="https://www.netlify.com/img/global/badges/netlify-color-bg.svg"
            width="82px"
            alt="netlify logo"
          />
        </a>
      </div>
    </>
  );
};

let lastHref: string;
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
    waitLoadingDelay = 50;
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
  const { href } = window.location;
  if (lastHref !== href) {
    setWaitLoadingState(true);
    NProgress.start();
    lastHref = href;
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
          breadcrumbName: formatMessage({
            id: 'menu.home',
            defaultMessage: 'Home',
          }),
        },
        ...routers,
      ]}
      footerRender={footerRender}
      menuDataRender={menuDataRender}
      formatMessage={formatMessage}
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
