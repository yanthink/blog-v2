import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Col, Row, Button, Icon, Divider, Affix } from 'antd';
import { router } from 'umi';
import { GridContent } from '@ant-design/pro-layout';
import { get } from 'lodash';
import { ConnectState, ConnectProps, Loading, AuthStateType, AccountCenterModelState } from '@/models/connect';
import Favorites from './components/Favorites';
import Comments from './components/Comments';
import Likers from './components/Likers';
import styles from './style.less';

const operationTabList = [
  {
    key: 'favorites',
    tab: '收藏',
  },
  {
    key: 'comments',
    tab: '评论',
  },
  {
    key: 'likers',
    tab: '点赞',
  },
];

interface CenterProps extends ConnectProps {
  loading: Loading;
  auth: AuthStateType;
  accountCenter: AccountCenterModelState;
}

interface CenterState {
  tabKey: 'favorites' | 'comments' | 'likers';
}

@connect(({ loading, auth, accountCenter }: ConnectState) => ({
  loading,
  auth,
  accountCenter,
}))
class Center extends PureComponent<CenterProps, CenterState> {
  state: CenterState = {
    tabKey: 'favorites',
  };

  onTabChange = (key: string) => {
    this.setState({
      tabKey: key as CenterState['tabKey'],
    });
  };

  renderChildrenByTabKey = (tabKey: CenterState['tabKey']) => {
    switch (tabKey) {
      case 'favorites':
        return <Favorites {...this.props} />;
      case 'comments':
        return <Comments {...this.props} />;
      case 'likers':
        return <Likers {...this.props} />;
      default:
        return null;
    }
  };


  render () {
    const { tabKey } = this.state;
    const { auth } = this.props;

    const dataLoading = !auth.logged;

    return (
      <GridContent>
        <Row gutter={24}>
          <Col lg={7} md={24}>
            <Affix className={styles.affix} offsetTop={0}>
              <Card bordered={false} loading={dataLoading}>
                <div>
                  <div className={styles.avatarHolder}>
                    <img alt="" src={auth.user.avatar} />
                    <div className={styles.name}>{auth.user.username}</div>
                    <div>{auth.user.bio || '暂无个人描述~'}</div>
                  </div>
                  <div className={styles.detail}>
                    <p>
                      <Icon type="mail" />
                      {auth.user.email || '暂无~'}
                    </p>
                    <p>
                      <Icon type="environment" />
                      {`${get(auth.user, 'extends.province')} `}
                      {get(auth.user, 'extends.city')}
                    </p>
                  </div>
                  <Divider />
                  <div>
                    <Button
                      block
                      size="large"
                      icon="edit"
                      onClick={() => router.push('/account/settings')}
                    >
                      编辑个人资料
                    </Button>
                  </div>
                </div>
              </Card>
            </Affix>
          </Col>
          <Col lg={17} md={24}>
            <Card
              className={styles.tabsCard}
              bordered={false}
              tabList={operationTabList}
              activeTabKey={tabKey}
              onTabChange={this.onTabChange}
            >
              {this.renderChildrenByTabKey(tabKey)}
            </Card>
          </Col>
        </Row>
      </GridContent>
    );
  }
}

export default Center;
