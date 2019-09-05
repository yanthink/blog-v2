import React from 'react';
import { Icon, List } from 'antd';
import { Link } from 'umi';
import marked from 'marked';
// @ts-ignore
import emojiToolkit from 'emoji-toolkit';
import Prism from 'prismjs';
import { parse } from 'qs';
import { get } from 'lodash';
import { AccountCenterModelState, ConnectProps, Loading } from '@/models/connect';
import { IComment } from '@/models/data';
import { showTime } from '@/utils/utils';
import styles from './index.less';

const defaultQueryParams = {
  include: 'target',
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

interface CommentsProps extends ConnectProps {
  loading: Loading;
  accountCenter: AccountCenterModelState;

  [key: string]: any;
}

class Comments extends React.Component<CommentsProps> {
  markdown: any;

  componentWillMount() {
    this.queryComments(this.props.location.search);
  }

  componentDidMount() {
    if (this.markdown) {
      Prism.highlightAllUnder(this.markdown);
    }
  }

  componentDidUpdate() {
    if (this.markdown) {
      Prism.highlightAllUnder(this.markdown);
    }
  }

  queryComments = (params: object | string) => {
    const query = params instanceof Object ? params : parse(params.replace(/^\?/, ''));

    const queryParams = {
      ...defaultQueryParams,
      ...query,
    };

    this.props.dispatch({
      type: 'accountCenter/fetchComments',
      payload: queryParams,
    });
  };

  setMarkdownRef = (ref: any) => {
    this.markdown = ref;
  };

  handlePageChange = (page: number, pageSize?: number) => {
    const { location: { search } } = this.props;
    const query = parse(search.replace(/^\?/, ''));
    this.queryComments({ ...query, page, pageSize });
  };

  renderItemTitle = (comment: IComment) => {
    if (comment.target_type === 'App\\Models\\Article') {
      return (
        <Link to={`/articles/${comment.target_id}/show`}>
          {get(comment, 'target.title')}
        </Link>
      );
    }

    return null;
  };

  render() {
    const {
      loading,
      accountCenter: { comments: { list, pagination } },
    } = this.props;

    return (
      <div className={styles.list}>
        <List
          size="large"
          rowKey="id"
          itemLayout="vertical"
          loading={loading.effects['accountCenter/fetchComments']}
          dataSource={list}
          pagination={{
            ...pagination,
            simple: window.innerWidth < 768,
            onChange: this.handlePageChange,
          }}
          renderItem={(item: IComment) => (
            <List.Item
              key={item.id}
            >
              <List.Item.Meta
                title={this.renderItemTitle(item)}
              />
              <div
                ref={this.setMarkdownRef}
                className={`${styles.content}  markdown-body`}
              >
                <div className={styles.description}>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: emojiToolkit.toImage(marked(item.content || '')),
                    }}
                  />
                </div>
                <div className={styles.extra}>
                  <IconText type="clock-circle-o" text={showTime(item.created_at || '')} />
                  <IconText key="like" type="like-o" text={item.like_count} />
                  <IconText type="message" key="message" text={item.reply_count} />
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>
    );
  }
}

export default Comments;
