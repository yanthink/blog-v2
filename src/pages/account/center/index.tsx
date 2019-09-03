import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Col, Row, Button, Icon, Divider, Affix } from 'antd';
import { router } from 'umi';
import { GridContent } from '@ant-design/pro-layout';
import { get } from 'lodash';
import { ConnectState, ConnectProps, Loading, AccountCenterModelState } from '@/models/connect';
import { IUser } from '@/models/data';
import Favorites from './components/Favorites';
import Comments from './components/Comments';
import Replys from './components/Replys';
import Likes from './components/Likes';
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
    key: 'replys',
    tab: '回复',
  },
  {
    key: 'likes',
    tab: '点赞',
  },
];

interface CenterProps extends ConnectProps {
  loading: Loading;
  currentUser: IUser;
  currentUserLoading: boolean;
  accountCenter: AccountCenterModelState;
}

interface CenterState {
  tabKey: 'favorites' | 'comments' | 'replys' | 'likes';
}

@connect(({ loading, user, accountCenter }: ConnectState) => ({
  loading,
  currentUser: user.currentUser,
  currentUserLoading: loading.effects['user/fetchCurrent'],
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
      case 'replys':
        return <Replys {...this.props} />;
      case 'likes':
        return <Likes {...this.props} />;
      default:
        return null;
    }
  };


  render() {
    const { tabKey } = this.state;
    const { currentUser, currentUserLoading } = this.props;
    const dataLoading = currentUserLoading || !(currentUser && currentUser.name);
    return (
      <GridContent>
        <Row gutter={24}>
          <Col lg={7} md={24}>
            <Affix offsetTop={0}>
              <Card bordered={false} loading={dataLoading}>
                <div>
                  <div className={styles.avatarHolder}>
                    <img alt="" src={get(currentUser, 'user_info.avatarUrl')} />
                    <div className={styles.name}>{currentUser.name}</div>
                    <div>{get(currentUser, 'user_info.signature') || '暂无个人描述~'}</div>
                  </div>
                  <div className={styles.detail}>
                    <p>
                      <Icon type="mail" />
                      {get(currentUser, 'email', '暂无~')}
                    </p>
                    <p>
                      <Icon type="environment" />
                      {`${get(currentUser, 'user_info.province')} `}
                      {get(currentUser, 'user_info.city')}
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
