import React from 'react';
import { Link, useRequest } from 'umi';
import { List } from 'antd';
import { ClockCircleOutlined, LikeOutlined, MessageOutlined } from '@ant-design/icons';
import { IArticle, IComment, ResponseResultType } from '@/models/I';
import { umiformatPaginationResult } from '@/utils/utils';
import MarkdownBody from '@/components/MarkdownBody';
import * as services from '../../services';
import styles from './style.less';

interface CommentsProps {}

const Comments: React.FC<CommentsProps> = () => {
  const { loading, data, pagination } = useRequest<ResponseResultType<IComment[]>, IComment>(
    ({ current, pageSize }) =>
      services.queryComments({
        page: current,
        per_page: pageSize,
        include: 'commentable,parent.user',
      }),
    {
      paginated: true,
      formatResult: umiformatPaginationResult,
    },
  );

  function renderItemTitle(comment: IComment) {
    switch (comment.commentable_type) {
      case 'App\\Models\\Article':
        return (
          <Link to={`/articles/${comment.commentable_id}`}>
            {(comment.commentable as IArticle)?.title}
          </Link>
        );
      default:
        return null;
    }
  }

  return (
    <div className={styles.list}>
      <List
        size="large"
        rowKey="id"
        itemLayout="vertical"
        loading={loading}
        dataSource={data?.list}
        pagination={{
          ...(pagination as any),
          responsive: true,
        }}
        renderItem={(item: IComment) => (
          <List.Item>
            <List.Item.Meta title={renderItemTitle(item)} />
            <div className={styles.content}>
              <div className={styles.description}>
                <MarkdownBody markdown={item.content!.combine_markdown!} />
              </div>
              <div className={styles.extra}>
                <span style={{ marginRight: 16 }}>
                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                  {item.created_at_timeago}
                </span>
                <span style={{ marginRight: 16 }}>
                  <LikeOutlined style={{ marginRight: 4 }} />
                  {item.friendly_up_voters_count}
                </span>
                <span style={{ marginRight: 16 }}>
                  <MessageOutlined style={{ marginRight: 4 }} />
                  {item.friendly_comments_count}
                </span>
              </div>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default Comments;
