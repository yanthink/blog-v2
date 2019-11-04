import React from 'react';
import { List, Comment, Tooltip, Icon, Tag } from 'antd';
import { get, unionBy } from 'lodash';
import Editor from './Editor';
import MarkdownBody from '@/components/MarkdownBody';
import Upvote from '@/components/Buttons/UpvoteBtn';
import DownvoteBtn from '@/components/Buttons/DownvoteBtn';
import { IArticle, IComment, IMeta } from '@/models/data';
import styles from './style.less';

export interface ArticleCommentsProps {
  article: IArticle;
  comments: IComment[];
  meta: IMeta;
  onPageChange: (page: number, pageSize?: number) => void;
  onFetchMoreChildrenComments: (comment_id: number) => void;
  loading: boolean;
  onSubmitComment: (values: { content: { markdown: string }, parent_id: number }, callback?: () => void) => void;
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

  handleSubmitComment = (values: { content: { markdown: string }, parent_id?: number }, callback?: () => void) => {
    this.props.onSubmitComment({ ...values, parent_id: values.parent_id || 0, }, callback);
  };

  handleCommentClick = (comment: IComment) => {
    const parent_id = this.state.parent_id === comment.id ? 0 : comment.id as number;
    this.setState({ parent_id });
  };

  renderLoadMoreReplysBtn = (comment: IComment) => {
    const { meta = {}, children = [], cache = {} } = comment;

    const total = meta.total || cache.comments_count || 0;
    const currentPage = meta.current_page || 0;
    const lastPage = meta.last_page || 0;

    if ((!currentPage && total > children.length) || currentPage < lastPage) {
      return (
        <div className={styles.loadMoreReplysBtn}>
          <a onClick={() => this.props.onFetchMoreChildrenComments(comment.id as number)}>
            更多{total - children.length}条回复 <Icon type="down" />
          </a>
        </div>
      );
    }

    return null;
  };

  renderChildren = (parentComment: IComment) => {
    const NestedEditor: React.FC<{ comment: IComment }> = ({ comment }) => {
      const { children = [], user = {} } = parentComment;
      const users = children.map(comment => comment.user);
      users.unshift(user);
      const defaultMentionUsers = unionBy(users, 'id');

      return (
        <Editor
          placeholder={`@${get(comment, 'user.username')}`}
          onSubmit={(values: { content: { markdown: string } }, callback?: () => void) => {
            this.handleSubmitComment({ ...values, parent_id: this.state.parent_id }, () => {
              this.setState({ parent_id: 0 }, callback);
            });
          }}
          submitting={this.props.submittingComment}
          minRows={4}
          defaultMentionUsers={defaultMentionUsers}
        />
      );
    };

    return (
      <>
        {parentComment.id === this.state.parent_id && <NestedEditor comment={parentComment} />}
        {parentComment.children && parentComment.children.map((comment: IComment) => (
          <div
            key={comment.id}
            id={`comment-${comment.id}`}
            className={this.props.topComment === comment.id ? styles.topComment : ''}
          >
            <Comment
              author={
                <span>
                  {get(comment, 'user.username')}
                  {this.props.article.user_id === comment.user_id && <Tag>博主</Tag>}
                  {parentComment.user_id === comment.user_id && <Tag>楼主</Tag>}
                </span>
              }
              avatar={get(comment, 'user.avatar')}
              content={<MarkdownBody markdown={get(comment, 'content.combine_markdown')} />}
              datetime={
                <Tooltip title={comment.created_at}>
                  <span>{comment.created_at_timeago}</span>
                </Tooltip>
              }
              actions={[
                <span><Upvote relation="comment" item={comment} /></span>,
                <span><DownvoteBtn relation="comment" item={comment} /></span>,
                <span onClick={() => this.handleCommentClick(comment)}>
                  <Icon type="message" /> 回复
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

  render () {
    const { article, comments, meta, onPageChange, loading, submittingComment, topComment } = this.props;

    return (
      <div className={styles.comments}>
        <Editor
          onSubmit={this.handleSubmitComment}
          submitting={submittingComment}
          preview
          defaultMentionUsers={unionBy(comments.map(comment => comment.user), 'id')}
        />
        <List
          className={styles.list}
          itemLayout="horizontal"
          dataSource={comments}
          header={`${meta.total || 0} 评论`}
          loading={loading}
          pagination={{
            total: meta.total,
            current: meta.current_page,
            pageSize: meta.per_page || 10,
            simple: window.innerWidth < 768,
            onChange: onPageChange,
          }}
          renderItem={(comment: IComment) => (
            <List.Item
              id={`comment-${comment.id}`}
              className={topComment === comment.id ? styles.topComment : ''}
            >
              <Comment
                author={
                  <span>
                    {get(comment, 'user.username')}
                    {article.user_id === comment.user_id && <Tag>博主</Tag>}
                  </span>
                }
                avatar={get(comment, 'user.avatar')}
                content={<MarkdownBody markdown={get(comment, 'content.markdown')} />}
                datetime={
                  <Tooltip title={comment.created_at}>
                    <span>{comment.created_at_timeago}</span>
                  </Tooltip>
                }
                actions={[
                  <span><Upvote relation="comment" item={comment} /></span>,
                  <span><DownvoteBtn relation="comment" item={comment} /></span>,
                  <span onClick={() => this.handleCommentClick(comment)}>
                    <Icon type="message" /> 评论
                  </span>,
                ]}
                children={this.renderChildren(comment)}
              />
            </List.Item>
          )}
        >
        </List>
      </div>
    );
  }
}

export default ArticleComments;
