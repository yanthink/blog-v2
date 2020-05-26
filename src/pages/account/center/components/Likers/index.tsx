import React from 'react';
import { Link, useRequest } from 'umi';
import { List } from 'antd';
import { ClockCircleOutlined, LikeOutlined } from '@ant-design/icons';
import Ellipsis from '@/components/Ellipsis';
import MarkdownBody from '@/components/MarkdownBody';
import { IArticle, IComment, IFollowable, ResponseResultType } from '@/models/I';
import { umiformatPaginationResult } from '@/utils/utils';
import * as services from '../../services';
import styles from './style.less';

interface LikesProps {}

const Likes: React.FC<LikesProps> = () => {
  const { loading, data, pagination } = useRequest<ResponseResultType<IFollowable[]>, IFollowable>(
    ({ current, pageSize }) =>
      services.queryFollowRelations({
        relation: ['like', 'upvote'],
        page: current,
        per_page: pageSize,
        include: 'followable.commentable',
      }),
    {
      paginated: true,
      formatResult: umiformatPaginationResult,
    },
  );

  function renderItemTitle(item: IFollowable) {
    switch (item.followable_type) {
      case 'App\\Models\\Article':
        return (
          <Link to={`/articles/${item.followable_id}`}>{(item.followable as IArticle)?.title}</Link>
        );
      case 'App\\Models\\Comment':
        return (
          <Link to={`/articles/${(item.followable as IComment).commentable_id!}`}>
            {((item.followable as IComment)?.commentable as IArticle)?.title}
          </Link>
        );
      default:
        return null;
    }
  }

  function renderItemDescription(item: IFollowable) {
    switch (item.followable_type) {
      case 'App\\Models\\Article':
        return (
          <Ellipsis lines={3}>
            {(item.followable as IArticle)?.content!.combine_markdown!.substr(0, 360)}
          </Ellipsis>
        );
      case 'App\\Models\\Comment':
        return (
          <MarkdownBody markdown={(item.followable as IComment)?.content!.combine_markdown!} />
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
        renderItem={(item: IFollowable) => (
          <List.Item>
            <List.Item.Meta title={renderItemTitle(item)} />
            <div className={`${styles.content} markdown-body`}>
              <div className={styles.description}>{renderItemDescription(item)}</div>
              <div className={styles.extra}>
                <span style={{ marginRight: 16 }}>
                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                  {item.created_at_timeago}
                </span>
                <span style={{ marginRight: 16 }}>
                  <LikeOutlined style={{ marginRight: 4 }} />
                  {(item.followable as IArticle)?.friendly_likes_count ||
                    (item.followable as IComment)?.friendly_up_voters_count}
                </span>
              </div>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};
export default Likes;
