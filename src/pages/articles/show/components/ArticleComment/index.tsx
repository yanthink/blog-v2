import React, { Fragment } from 'react';
import { Comment, Tooltip, List, Button, Icon, Tag } from 'antd';
import { Link } from 'umi';
import { get } from 'lodash';
import moment from 'moment';
import marked from 'marked';
import Prism from 'prismjs';
// @ts-ignore
import emojiToolkit from 'emoji-toolkit';
import { UserType } from '@/models/user';
import { ArticleType, PaginationType } from '@/pages/articles/list/data';
import Editor from './Editor';
import { CommentType, ReplyType } from '../../data';
import 'emoji-assets/sprites/joypixels-sprite-32.min.css';
import styles from './style.less';

interface ArticleCommentState {
  replyEditor: {
    commentId?: number;
    replyId?: number;
  }
}

interface ArticleCommentProps {
  currentUser: UserType;
  article: ArticleType;
  data: CommentType[];
  pagination: Partial<PaginationType>;
  onCommentSubmit: (values: { content: string }, callback?: () => void) => void;
  onReplySubmit: (
    values: { content: string, commentId: number, replyId?: number },
    callback?: () => void,
  ) => void;
  commentSubmitting: boolean;
  replySubmitting: boolean;
  onCommentLike: (id: number) => void;
  onReplyLike: (commentId: number, replyId: number) => void;
  commentsLoading: boolean;
  onFetchMoreComments: () => void;
  onFetchMoreReplys: (commentId: number) => void;
}

class ArticleComment extends React.Component<ArticleCommentProps, ArticleCommentState> {
  state: ArticleCommentState = {
    replyEditor: {},
  };

  markdown: any;

  componentDidMount() {
    Prism.highlightAllUnder(this.markdown);
  }

  componentDidUpdate() {
    Prism.highlightAllUnder(this.markdown);
  }

  setMarkdownRef = (ref: any) => {
    this.markdown = ref;
  };

  handleCommentSubmit = (values: { content: string }, callback?: () => void) => {
    const { onCommentSubmit } = this.props;
    onCommentSubmit(values, callback);
  };

  handleReplySubmit = (values: { content: string }, callback?: () => void) => {
    const { onReplySubmit } = this.props;
    const { replyEditor } = this.state;
    if (replyEditor.commentId) {
      onReplySubmit(
        {
          ...values,
          commentId: replyEditor.commentId,
          replyId: replyEditor.replyId,
        },
        callback,
      );
    }
  };

  handleCommentBtnClick = (comment: CommentType) => {
    const { replyEditor } = this.state;

    if (replyEditor.commentId === comment.id && !replyEditor.replyId) {
      this.setState({ replyEditor: {} });
      return;
    }

    this.setState({
      replyEditor: { commentId: comment.id },
    })
  };

  handleReplyBtnClick = (comment: CommentType, reply: ReplyType) => {
    const { replyEditor } = this.state;

    if (replyEditor.commentId === comment.id && replyEditor.replyId === reply.id) {
      this.setState({ replyEditor: {} });
      return;
    }

    this.setState({
      replyEditor: { commentId: comment.id, replyId: reply.id },
    })
  };

  renderLoadMoreCommentsBtn = () => {
    const { pagination, commentsLoading, onFetchMoreComments } = this.props;

    if (pagination.total && pagination.pageSize && pagination.current) {
      const totalPage = Math.ceil(pagination.total / pagination.pageSize);

      if (pagination.current < totalPage) {
        return (
          <div className={styles.loadMoreCommentsBtn}>
            <Button
              onClick={onFetchMoreComments}
            >
              {
                commentsLoading ?
                  (
                    <span>
                      <Icon type="loading" /> 加载中...
                    </span>
                  ) :
                  (
                    '加载更多'
                  )
              }
            </Button>
          </div>
        );
      }
    }

    return null;
  };

  renderLoadMoreReplysBtn = (comment: CommentType) => {
    const { onFetchMoreReplys } = this.props;
    const { replysPagination, reply_count: replyCount = 0, replys = [] } = comment;

    if (
      replysPagination &&
      replysPagination.total &&
      replysPagination.pageSize &&
      replysPagination.current
    ) {
      const totalPage = Math.ceil(replysPagination.total / replysPagination.pageSize);

      if (replysPagination.current < totalPage) {
        return (
          <div className={styles.loadMoreReplysBtn}>
            <a onClick={() => onFetchMoreReplys(comment.id as number)}>
              更多{replyCount - replys.length}条回复 <Icon type="down" />
            </a>
          </div>
        );
      }

      return null;
    }

    if (replyCount > replys.length) {
      return (
        <div className={styles.loadMoreReplysBtn}>
          <a onClick={() => onFetchMoreReplys(comment.id as number)}>
            更多{replyCount - replys.length}条回复 <Icon type="down" />
          </a>
        </div>
      );
    }

    return null;
  };

  renderReplys = (comment: CommentType) => {
    const { article, onReplyLike, currentUser, replySubmitting } = this.props;
    const { replyEditor } = this.state;
    const { replys = [] } = comment;

    const replyEditorProps = {
      className: styles.replyEditorBox,
      currentUser,
      submitting: replySubmitting,
      onSubmit: this.handleReplySubmit,
      minRows: 1,
      maxLength: 1024,
    };

    return (
      <div>
        {
          replyEditor.commentId === comment.id && !replyEditor.replyId &&
          <Editor {...replyEditorProps} placeholder={`@ ${get(comment, 'user.name')}`} />
        }
        {
          replys.map(reply => (
            <Fragment key={reply.id}>
              <Comment
                author={
                  <span>
                    {get(reply, 'user.name')}
                    {
                      /* eslint no-nested-ternary: 0 */
                      article && reply.user_id === article.author_id
                        ? <Tag>作者</Tag>
                        : (reply.user_id === comment.user_id ? <Tag>楼主</Tag> : null)
                    }
                  </span>
                }
                avatar={get(reply, 'user.user_info.avatarUrl')}
                content={
                  <div
                    className={styles.commentContent}
                  >
                    {reply.parent && <Link to="#" className={styles.mentions}>@ {get(reply, 'parent.user.name')}</Link>}
                    <span
                      dangerouslySetInnerHTML={{
                        __html: emojiToolkit.toImage(
                          marked(reply.content || ''),
                        ),
                      }}
                    />
                  </div>
                }
                datetime={
                  <Tooltip title={reply.created_at}>
                    <span>
                      {moment(reply.created_at).fromNow()}
                    </span>
                  </Tooltip>
                }
                actions={[
                  <span key="comment-basic-like">
                    <Tooltip title="为此评论点赞">
                      <Icon
                        type="like"
                        theme={reply.likes && reply.likes.length > 0 ? 'twoTone' : 'outlined'}
                        onClick={() => onReplyLike(comment.id as number, reply.id as number)}
                      />
                    </Tooltip>
                    <span style={{ paddingLeft: 4, cursor: 'auto' }}>{reply.like_count}</span>
                  </span>,
                  <span
                    key="comment-basic-reply"
                    className={styles.replyBtn}
                    onClick={() => this.handleReplyBtnClick(comment, reply)}
                  >
                    <Tooltip title={`回复 ${get(reply, 'user.name')}`}>
                      <Icon type="message" /> 回复
                    </Tooltip>
                  </span>,
                ]}
              />
              {
                replyEditor.commentId === comment.id && replyEditor.replyId === reply.id &&
                <Editor {...replyEditorProps} placeholder={`@ ${get(reply, 'user.name')}`} />
              }
            </Fragment>
          ))
        }
        {this.renderLoadMoreReplysBtn(comment)}
      </div>
    )
  };

  render() {
    const { currentUser, data, pagination, onCommentLike, commentSubmitting } = this.props;

    const commentEditorProps = {
      placeholder: '支持 markdown 语法！',
      className: styles.commentEditorBox,
      currentUser,
      submitting: commentSubmitting,
      onSubmit: this.handleCommentSubmit,
      minRows: 5,
      maxLength: 1024,
      preview: true,
    };

    /* eslint react/no-children-prop: 0 */
    return (
      <div className="markdown-body" ref={this.setMarkdownRef}>
        <Editor {...commentEditorProps} />
        <List
          className={styles.commentList}
          header={`${pagination.total} 评论`}
          itemLayout="horizontal"
          dataSource={data}
          loadMore={this.renderLoadMoreCommentsBtn()}
          renderItem={(item: CommentType) => (
            <li>
              <Comment
                author={get(item, 'user.name')}
                avatar={get(item, 'user.user_info.avatarUrl')}
                content={
                  <div
                    className={styles.commentContent}
                    dangerouslySetInnerHTML={{
                      __html: emojiToolkit.toImage(marked(item.content || '')),
                    }}
                  />
                }
                datetime={
                  <Tooltip title={item.created_at}>
                    <span>
                      {moment(item.created_at).fromNow()}
                    </span>
                  </Tooltip>
                }
                actions={[
                  <span key="comment-basic-like">
                    <Tooltip title="为此评论点赞">
                      <Icon
                        type="like"
                        theme={item.likes && item.likes.length > 0 ? 'twoTone' : 'outlined'}
                        onClick={() => onCommentLike(item.id as number)}
                      />
                    </Tooltip>
                    <span style={{ paddingLeft: 4, cursor: 'auto' }}>{item.like_count}</span>
                  </span>,
                  <span
                    key="comment-basic-reply"
                    onClick={() => this.handleCommentBtnClick(item)}
                  >
                    <Icon type="message" /> 评论
                  </span>,
                ]}
                children={this.renderReplys(item)}
              />
            </li>
          )}
        />
      </div>
    );
  }
}

export default ArticleComment;
