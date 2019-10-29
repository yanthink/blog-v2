import React from 'react';
import { List, Comment, Tooltip, Icon, Tag } from 'antd';
import { get, unionBy } from 'lodash';
import Editor from './Editor';
import MarkdownBody from '@/components/MarkdownBody';
import Upvote from '@/components/Buttons/UpvoteBtn';
import DownvoteBtn from '@/components/Buttons/DownvoteBtn';
import { IArticle, IComment, IPagination } from '@/models/data';
import styles from './style.less';

export interface ArticleCommentsProps {
  article: IArticle;
  comments: IComment[];
  pagination: IPagination;
  onPageChange: (page: number, pageSize?: number) => void;
  loading: boolean;
  onSubmitComment: (values: { content: { markdown: string }, parent_id: number }, callback?: () => void) => void;
  submittingComment: boolean;
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
          <div key={comment.id} id={`comment-${comment.id}`}>
            <Comment
              author={
                <span>
                  {get(comment, 'user.username')}
                  {this.props.article.user_id === comment.user_id && <Tag>博主</Tag>}
                  {parentComment.user_id === comment.user_id && <Tag>楼主</Tag>}
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
                  <Icon type="message" /> 回复
                </span>,
              ]}
            />
            {comment.id === this.state.parent_id && <NestedEditor comment={comment} />}
          </div>
        ))}
      </>
    );
  };

  render () {
    const { article, comments, pagination, onPageChange, loading, submittingComment } = this.props;

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
          header={`${pagination.total || 0} 评论`}
          loading={loading}
          pagination={{
            total: pagination.total,
            current: pagination.current_page,
            pageSize: pagination.per_page || 10,
            simple: window.innerWidth < 768,
            onChange: onPageChange,
          }}
          renderItem={(comment: IComment) => (
            <List.Item id={`comment-${comment.id}`}>
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
