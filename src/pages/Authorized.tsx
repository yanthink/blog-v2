import React from 'react';
import Redirect from 'umi/redirect';
import { connect } from 'dva';
import pathToRegexp from 'path-to-regexp';
import Authorized from '@/utils/Authorized';
import { ConnectProps, ConnectState, Route, AuthStateType } from '@/models/connect';

interface AuthComponentProps extends ConnectProps {
  auth: AuthStateType;
}

const getRouteAuthority = (path: string, routeData: Route[]) => {
  let authorities: string[] | string | undefined;
  routeData.forEach(route => {
    // match prefix
    if (pathToRegexp(`${route.path}(.*)`).test(path)) {
      // exact match
      if (route.path === path) {
        authorities = route.authority || authorities;
      }
      // get children authority recursively
      if (route.routes) {
        authorities = getRouteAuthority(path, route.routes) || authorities;
      }
    }
  });
  return authorities;
};

const AuthComponent: React.FC<AuthComponentProps> = ({
  children,
  route = {
    routes: [],
  },
  location = {
    pathname: '',
  },
  auth,
}) => {
  const { logged } = auth;
  const { routes = [] } = route;
  return (
    <Authorized
      authority={getRouteAuthority(location.pathname, routes) || ''}
      noMatch={logged ? <Redirect to="/exception/403" /> : <Redirect to="/articles/list" />}
    >
      {children}
    </Authorized>
  );
};

export default connect(({ auth }: ConnectState) => ({
  auth,
}))(AuthComponent);
