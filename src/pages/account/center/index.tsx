import React, { useState } from 'react';
import { connect, history } from 'umi';
import { GridContent } from '@ant-design/pro-layout';
import { Affix, Button, Card, Col, Divider, Row } from 'antd';
import { MailOutlined, EnvironmentOutlined, EditOutlined } from '@ant-design/icons';
import { AuthModelState, ConnectProps, ConnectState } from '@/models/connect';
import Favorites from './components/Favorites';
import Comments from './components/Comments';
import Likers from './components/Likers';
import styles from './style.less';

interface AccountCenterProps extends ConnectProps {
  auth: AuthModelState;
}

type TabKeyType = 'favorites' | 'comments' | 'likers';

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

const AccountCenter: React.FC<AccountCenterProps> = (props) => {
  const [tabKey, setTabKey] = useState<TabKeyType>('favorites');

  function renderChildrenByTabKey(key: TabKeyType) {
    switch (key) {
      case 'favorites':
        return <Favorites />;
      case 'comments':
        return <Comments />;
      case 'likers':
        return <Likers />;
      default:
        return null;
    }
  }

  return (
    <GridContent>
      <Row gutter={24}>
        <Col lg={7} md={24} className={styles.leftCard}>
          <Affix className={styles.affix} offsetTop={0}>
            <Card bordered={false} loading={!props.auth.logged}>
              <>
                <div className={styles.avatarHolder}>
                  <img alt="" src={props.auth.user.avatar} />
                  <div className={styles.name}>{props.auth.user.username}</div>
                  <div>{props.auth.user.bio || '暂无个人描述~'}</div>
                </div>
                <div className={styles.detail}>
                  <p>
                    <MailOutlined />
                    {props.auth.user.email || '暂无~'}
                  </p>
                  <p>
                    <EnvironmentOutlined />
                    <span>{props.auth.user.extends?.province}</span>
                    <span>&nbsp;&nbsp;{props.auth.user.extends?.city}</span>
                  </p>
                </div>
                <Divider />
                <div>
                  <Button
                    block
                    size="large"
                    icon={<EditOutlined />}
                    onClick={() => history.push('/account/settings')}
                  >
                    编辑个人资料
                  </Button>
                </div>
              </>
            </Card>
          </Affix>
        </Col>
        <Col lg={17} md={24} className={styles.tabsCard}>
          <Card
            bordered={false}
            tabList={operationTabList}
            activeTabKey={tabKey}
            onTabChange={(key) => setTabKey(key as TabKeyType)}
          >
            {renderChildrenByTabKey(tabKey)}
          </Card>
        </Col>
      </Row>
    </GridContent>
  );
};

export default connect(({ auth }: ConnectState) => ({ auth }))(AccountCenter);
