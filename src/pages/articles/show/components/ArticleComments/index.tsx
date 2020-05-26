import React from 'react';
import { List, Comment, Tooltip, Tag } from 'antd';
import { MessageOutlined, DownOutlined } from '@ant-design/icons';
import { get, unionBy } from 'lodash';
import { PaginationConfig } from 'antd/es/pagination';
import MarkdownBody from '@/components/MarkdownBody';
import Upvote from '@/components/Buttons/UpvoteBtn';
import DownvoteBtn from '@/components/Buttons/DownvoteBtn';
import { IArticle, IComment, IUser } from '@/models/I';
import Editor from './Editor';
import styles from './style.less';

export interface ArticleCommentsProps {
  article: IArticle;
  comments: IComment[];
  pagination: PaginationConfig;
  loading: boolean;
  onFetchMoreChildrenComments: (comment_id: number) => Promise<void>;
  onSubmit: (values: { content: { markdown: string }; parent_id: number }) => Promise<void>;
  submittingComment: boolean;
  topComment?: number;
}

export interface ArticleCommentsState {
  parent_id: number;
}

class ArticleComments extends React.Component<ArticleCommentsProps, ArticleCommentsState> {
  state: ArticleCommentsState = {
    parent_id: 0,
  };

  handleSubmit = async (values: { content: { markdown: string } }) => {
    await this.props.onSubmit({ ...values, parent_id: this.state.parent_id });
    this.setState({ parent_id: 0 });
  };

  handleCommentClick = (comment: IComment) => {
    // eslint-disable-next-line react/no-access-state-in-setstate
    const parent_id = this.state.parent_id === comment.id ? 0 : comment.id!;
    this.setState({ parent_id });
  };

  renderLoadMoreReplysBtn = (comment: IComment) => {
    const total = comment.meta?.total || comment.cache?.comments_count || 0;
    const currentPage = comment.meta?.current_page || 0;
    const lastPage = comment.meta?.last_page || 0;

    if ((!currentPage && total > (comment.children?.length || 0)) || currentPage < lastPage) {
      return (
        <div className={styles.loadMoreReplysBtn}>
          <a onClick={() => this.props.onFetchMoreChildrenComments(comment.id!)}>
            更多{total - (comment.children?.length || 0)}条回复 <DownOutlined />
          </a>
        </div>
      );
    }

    return null;
  };

  renderChildren = (parentComment: IComment) => {
    const NestedEditor: React.FC<{ comment: IComment }> = ({ comment }) => {
      const users = parentComment.children?.map((child) => child.user) as IUser[];
      users.unshift(parentComment.user!);
      const defaultMentionUsers = unionBy(users, 'id') as IUser[];

      return (
        <Editor
          placeholder={`@${get(comment, 'user.username')}`}
          onSubmit={this.handleSubmit}
          submitting={this.props.submittingComment}
          defaultMentionUsers={defaultMentionUsers}
          minRows={4}
        />
      );
    };

    return (
      <>
        {parentComment.id === this.state.parent_id && <NestedEditor comment={parentComment} />}
        {parentComment.children &&
          parentComment.children.map((comment: IComment) => (
            <div
              key={comment.id}
              id={`comment-${comment.id}`}
              className={this.props.topComment === comment.id ? styles.topComment : ''}
            >
              <Comment
                author={
                  <span>
                    {comment.user?.username}
                    {this.props.article.user_id === comment.user_id && <Tag>博主</Tag>}
                    {parentComment.user_id === comment.user_id && <Tag>楼主</Tag>}
                  </span>
                }
                avatar={comment.user?.avatar}
                content={<MarkdownBody markdown={comment.content?.combine_markdown!} />}
                datetime={
                  <Tooltip title={comment.created_at}>
                    <span>{comment.created_at_timeago}</span>
                  </Tooltip>
                }
                actions={[
                  <span>
                    <Upvote relation="comment" item={comment} />
                  </span>,
                  <span>
                    <DownvoteBtn relation="comment" item={comment} />
                  </span>,
                  <span onClick={() => this.handleCommentClick(comment)}>
                    <MessageOutlined /> 回复
                  </span>,
                ]}
              />
              {comment.id === this.state.parent_id && <NestedEditor comment={comment} />}
            </div>
          ))}
        {this.renderLoadMoreReplysBtn(parentComment)}
      </>
    );
  };

  render() {
    const { article, comments, pagination, loading, submittingComment, topComment } = this.props;

    if (!article || !comments) {
      return null;
    }

    return (
      <div className={styles.comments}>
        <Editor
          onSubmit={this.handleSubmit}
          submitting={submittingComment}
          defaultMentionUsers={unionBy(comments.map((comment) => comment.user) as IUser[], 'id')}
          preview
        />
        <List
          className={styles.list}
          itemLayout="horizontal"
          dataSource={comments}
          header={`${pagination.total || 0} 评论`}
          loading={loading}
          pagination={pagination}
          renderItem={(comment: IComment) => (
            <List.Item
              id={`comment-${comment.id}`}
              className={topComment === comment.id ? styles.topComment : ''}
            >
              <Comment
                author={
                  <span>
                    {comment.user?.username}
                    {article.user_id === comment.user_id && <Tag>博主</Tag>}
                  </span>
                }
                avatar={comment.user?.avatar}
                content={<MarkdownBody markdown={comment.content?.combine_markdown!} />}
                datetime={
                  <Tooltip title={comment.created_at}>
                    <span>{comment.created_at_timeago}</span>
                  </Tooltip>
                }
                actions={[
                  <span>
                    <Upvote relation="comment" item={comment} />
                  </span>,
                  <span>
                    <DownvoteBtn relation="comment" item={comment} />
                  </span>,
                  <span onClick={() => this.handleCommentClick(comment)}>
                    <MessageOutlined /> 评论
                  </span>,
                ]}
                children={this.renderChildren(comment)}
              />
            </List.Item>
          )}
        />
      </div>
    );
  }
}

export default ArticleComments;
