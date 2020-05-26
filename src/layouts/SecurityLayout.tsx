import React from 'react';
import { PageLoading } from '@ant-design/pro-layout';
import { connect } from 'umi';
import { ConnectState, ConnectProps, AuthModelState } from '@/models/connect';

interface SecurityLayoutProps extends ConnectProps {
  auth: AuthModelState;
  loading: boolean;
}

interface SecurityLayoutState {
  isReady: boolean;
}

class SecurityLayout extends React.Component<SecurityLayoutProps, SecurityLayoutState> {
  state: SecurityLayoutState = {
    isReady: false,
  };

  componentDidMount() {
    this.setState({
      isReady: true,
    });

    const { dispatch } = this.props;

    if (dispatch) {
      dispatch({ type: 'auth/loadUser' });
    }
  }

  render() {
    const { isReady } = this.state;
    const { children, loading, auth } = this.props;

    if ((!auth.logged && loading) || !isReady) {
      return <PageLoading />;
    }

    return children;
  }
}

export default connect(({ auth, loading }: ConnectState) => ({
  auth,
  loading: loading.effects['auth/loadUser'],
}))(SecurityLayout);
