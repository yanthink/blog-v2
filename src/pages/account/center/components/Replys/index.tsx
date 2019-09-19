import React from 'react';
import { Icon, List } from 'antd';
import { Link } from 'umi';
import marked from 'marked';
// @ts-ignore
import emojiToolkit from 'emoji-toolkit';
import { parse } from 'qs';
import { get } from 'lodash';
import { AccountCenterModelState, ConnectProps, Loading } from '@/models/connect';
import { IReply } from '@/models/data';
import { showTime } from '@/utils/utils';
import styles from './index.less';

const defaultQueryParams = {
  include: 'target.user,parent.user,target.target',
};

const IconText: React.FC<{
  type: string;
  text: React.ReactNode;
}> = ({ type, text }) => (
  <span style={{ marginRight: 16 }}>
    <Icon type={type} style={{ marginRight: 4 }} />
    {text}
  </span>
);

interface ReplysProps extends ConnectProps {
  loading: Loading;
  accountCenter: AccountCenterModelState;

  [key: string]: any;
}

class Replys extends React.Component<ReplysProps> {
  componentWillMount() {
    this.queryReplys(this.props.location.search);
  }

  queryReplys = (params: object | string) => {
    const query = params instanceof Object ? params : parse(params.replace(/^\?/, ''));

    const queryParams = {
      ...defaultQueryParams,
      ...query,
    };

    this.props.dispatch({
      type: 'accountCenter/fetchReplys',
      payload: queryParams,
    });
  };

  handlePageChange = (page: number, pageSize?: number) => {
    const { location: { search } } = this.props;
    const query = parse(search.replace(/^\?/, ''));
    this.queryReplys({ ...query, page, pageSize });
  };

  renderItemTitle = (reply: IReply) => {
    if (reply.target && reply.target_type === 'App\\Models\\Comment') {
      return (
        <Link to={`/articles/${reply.target.target_id}/show`}>
          {get(reply, 'target.target.title')}
        </Link>
      );
    }

    return null;
  };

  render() {
    const {
      loading,
      accountCenter: { replys: { list, pagination } },
    } = this.props;

    return (
      <div className={styles.list}>
        <List
          size="large"
          rowKey="id"
          itemLayout="vertical"
          loading={loading.effects['accountCenter/fetchReplys']}
          dataSource={list}
          pagination={{
            ...pagination,
            simple: window.innerWidth < 768,
            onChange: this.handlePageChange,
          }}
          renderItem={(item: IReply) => (
            <List.Item
              key={item.id}
            >
              <List.Item.Meta
                title={this.renderItemTitle(item)}
              />
              <div className={`${styles.content}  markdown-body`}>
                <div className={styles.description}>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: emojiToolkit.toImage(marked(item.content || '')),
                    }}
                  />
                  <span> // </span>
                  <Link to="#">@ {item.parent ? get(item, 'parent.user.name') : get(item, 'target.user.name')}</Link>
                  <span>：</span>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: emojiToolkit.toImage(
                        marked(item.parent ? get(item, 'parent.content') : get(item, 'target.content')),
                      ),
                    }}
                  />
                </div>
                <div className={styles.extra}>
                  <IconText type="clock-circle-o" text={showTime(item.created_at || '')} />
                  <IconText key="like" type="like-o" text={item.like_count} />
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>
    );
  }
}

export default Replys;
