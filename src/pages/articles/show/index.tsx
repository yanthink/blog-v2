import React from 'react';
import { Card, Row, Col, Button, Skeleton, Modal, Icon, Tooltip, message, Tag } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { connect } from 'dva';
import { Link, router } from 'umi';
import { stringify } from 'qs';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { getPageQuery } from '@/components/GlobalHeader/AvatarDropdown';
import Authorized from '@/utils/Authorized';
import {
  ConnectState,
  ConnectProps,
  Loading,
  UserModelState,
  ArticleShowModelState,
} from '@/models/connect';
import ArticleContent from './components/ArticleContent';
import ArticleComment from './components/ArticleComment';
import Tocify from './components/ArticleContent/tocify';
import styles from './style.less';

const { confirm } = Modal;

const withReplysLimit = 3;

const defaultQueryParams = {
  include: 'author,tags',
};

const defaultFetchCommentsQueryParams = {
  include: `user,replys:limit(${withReplysLimit}),replys.user,replys.parent.user`,
  pageSize: 10,
};

interface ArticleShowState {
  fetchingArticle: boolean;
  fetchingComments: boolean;
  tocify?: Tocify;
}

interface ArticleShowProps extends ConnectProps, FormComponentProps {
  loading: Loading;
  user: UserModelState;
  articleShow: ArticleShowModelState;
  match: ConnectProps['match'] & {
    params: { [K in 'id']: string };
  };
}

@connect(({ loading, user, articleShow }: ConnectState) => ({
  loading,
  user,
  articleShow,
}))
class ArticleShow extends React.Component<ArticleShowProps, ArticleShowState> {
  state: ArticleShowState = {
    fetchingArticle: true,
    fetchingComments: true,
  };

  commentBoxId = '';

  constructor(props: ArticleShowProps) {
    super(props);

    this.state = {
      fetchingArticle: true,
      fetchingComments: true,
    }
  }

  async componentWillMount() {
    const { dispatch, match: { params }, location } = this.props;

    dispatch({
      type: 'articleShow/fetchArticle',
      id: params.id,
      payload: {
        ...defaultQueryParams,
        ...location.query,
      },
    });

    dispatch({
      type: 'articleShow/fetchComments',
      articleId: params.id,
      payload: { ...defaultFetchCommentsQueryParams },
    });
  }

  componentDidUpdate(prevProps: ArticleShowProps) {
    /* eslint react/no-did-update-set-state:0 */
    if (
      prevProps.loading.effects['articleShow/fetchArticle'] &&
      this.props.loading.effects['articleShow/fetchArticle'] === false
    ) {
      this.setState({ fetchingArticle: false });
    }

    if (
      prevProps.loading.effects['articleShow/fetchComments'] &&
      this.props.loading.effects['articleShow/fetchComments'] === false
    ) {
      this.setState({ fetchingComments: false });
    }
  }

  setTocify = (tocify: Tocify) => {
    this.commentBoxId = tocify.add('评论区', 1);
    this.setState({ tocify });
  };

  loginConfirm = () => {
    confirm({
      title: '登录确认?',
      content: '您还没有登录，点击【确定】前去登录。',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        const { redirect } = getPageQuery();
        // redirect
        if (window.location.pathname !== '/auth/login' && !redirect) {
          router.replace({
            pathname: '/auth/login',
            search: stringify({
              redirect: window.location.href,
            }),
          });
        }
      },
      onCancel() {
      },
    });
  };

  handleLike = () => {
    const { dispatch, user: { currentUser }, match: { params } } = this.props;

    if (!currentUser || !currentUser.name) {
      this.loginConfirm();
      return;
    }

    dispatch({
      type: 'articleShow/articleLike',
      id: params.id,
    });
  };

  handleFavorite = () => {
    const { dispatch, user: { currentUser }, match: { params } } = this.props;

    if (!currentUser || !currentUser.name) {
      this.loginConfirm();
      return;
    }

    dispatch({
      type: 'articleShow/articleFavorite',
      id: params.id,
    });
  };

  handleCommentLike = (commentId: number) => {
    const { dispatch, user: { currentUser } } = this.props;

    if (!currentUser || !currentUser.name) {
      this.loginConfirm();
      return;
    }

    dispatch({
      type: 'articleShow/commentLike',
      commentId,
    });
  };

  handleReplyLike = (commentId: number, replyId: number) => {
    const { dispatch, user: { currentUser } } = this.props;

    if (!currentUser || !currentUser.name) {
      this.loginConfirm();
      return;
    }

    dispatch({
      type: 'articleShow/replyLike',
      commentId,
      replyId,
    });
  };

  handleCommentSubmit = (values: { content: string }, callback?: () => void) => {
    const { dispatch, user: { currentUser }, match: { params } } = this.props;

    if (!currentUser || !currentUser.name) {
      this.loginConfirm();
      return;
    }

    dispatch({
      type: 'articleShow/sendComment',
      articleId: params.id,
      payload: {
        ...defaultFetchCommentsQueryParams,
        ...values,
      },
      callback: () => {
        message.success('评论成功！');
        if (callback) {
          callback();
        }
      },
    });
  };

  handleReplySubmit = (
    values: { content: string, commentId: number, replyId?: number },
    callback?: () => void,
  ) => {
    const { dispatch, user: { currentUser } } = this.props;
    const { content, commentId, replyId } = values;

    if (!currentUser || !currentUser.name) {
      this.loginConfirm();
      return;
    }

    dispatch({
      type: 'articleShow/sendReply',
      commentId,
      payload: {
        content,
        parent_id: replyId,
        include: 'user,parent.user',
      },
      callback: () => {
        message.success('评论成功！');
        if (callback) {
          callback();
        }
      },
    });
  };

  handleFetchMoreComments = () => {
    const { dispatch, match: { params } } = this.props;

    dispatch({
      type: 'articleShow/appendFetchComments',
      articleId: params.id,
      payload: { ...defaultFetchCommentsQueryParams },
    });
  };

  handleFetchMoreReplys = (commentId: number) => {
    const { dispatch } = this.props;

    dispatch({
      type: 'articleShow/appendFetchReplys',
      commentId,
      payload: { include: 'user,parent.user' },
    });
  };

  render() {
    const {
      user,
      loading,
      articleShow: { article, comments, commentsPagination },
      match: { params },
    } = this.props;

    const { fetchingArticle, fetchingComments, tocify } = this.state;

    const HeaderAction = (
      <Link to={`/articles/${params.id}/edit`}>
        <Button type="primary" icon="edit">
          编辑文章
        </Button>
      </Link>
    );

    return (
      // @ts-ignore
      <PageHeaderWrapper extra={Authorized.check('articles.update', HeaderAction, null)}>
        <Row gutter={24} type="flex">
          <Col xl={18} lg={24} md={24} sm={24} xs={24}>
            <Card bordered={false}>
              <Skeleton
                active
                paragraph={{ rows: 13 }}
                loading={fetchingArticle}
              >
                <ArticleContent article={article} getTocify={this.setTocify} />
                <div className={styles.tags}>
                  <Icon type="tags" theme="filled" style={{ marginRight: 12, fontSize: 16 }} />
                  {
                    article &&
                    article.tags &&
                    article.tags.map(tag => (
                      <Link key={tag.id} to={`/articles/list?tagIds[0]=${tag.id}`}>
                        <Tag color="orange">{tag.name}</Tag>
                      </Link>
                    ))
                  }
                </div>
                <div className={styles.action}>
                  <Tooltip title="点赞">
                    <span className={styles.like}>
                      <Icon
                        type="like"
                        theme={article.likes && article.likes.length > 0 ? 'twoTone' : 'outlined'}
                        twoToneColor="#13C2C2"
                        onClick={this.handleLike}
                      />
                      {article.like_count}
                    </span>
                  </Tooltip>
                  <Tooltip title="收藏">
                    <Icon
                      className={styles.favorite}
                      type="heart"
                      theme={article.favorites && article.favorites.length > 0 ? 'twoTone' : 'outlined'}
                      twoToneColor="#eb2f96"
                      onClick={this.handleFavorite}
                    />
                  </Tooltip>
                </div>
              </Skeleton>
            </Card>
            <Card bordered={false} className={styles.commentCard}>
              <div id={this.commentBoxId}>
                <Skeleton
                  active
                  avatar
                  paragraph={{ rows: 3 }}
                  loading={fetchingComments}
                >
                  <ArticleComment
                    currentUser={user.currentUser || {}}
                    article={article || {}}
                    data={comments || []}
                    pagination={commentsPagination}
                    commentsLoading={loading.effects['articleShow/appendFetchComments']}
                    onFetchMoreComments={this.handleFetchMoreComments}
                    onFetchMoreReplys={this.handleFetchMoreReplys}
                    onCommentLike={this.handleCommentLike}
                    onReplyLike={this.handleReplyLike}
                    onCommentSubmit={this.handleCommentSubmit}
                    onReplySubmit={this.handleReplySubmit}
                    commentSubmitting={loading.effects['articleShow/sendComment']}
                    replySubmitting={loading.effects['articleShow/sendReply']}
                  />
                </Skeleton>
              </div>
            </Card>
          </Col>
          <Col xl={6} lg={0} md={0} sm={0} xs={0}>
            <Card bordered={false} style={{ marginBottom: 24 }}>
              <img
                src="http://qiniu.einsition.com/article/a29/aeaaf2374ac87d119f537916f6a0a579.jpeg"
                alt="小程序二维码"
                style={{ width: '100%', height: '100%' }}
              />
            </Card>
            <div className={styles.tocifyBox}>
              <Skeleton
                active
                paragraph={{ rows: 10 }}
                loading={!tocify}
              >
                {tocify && tocify.render()}
              </Skeleton>
            </div>
          </Col>
        </Row>
      </PageHeaderWrapper>
    );
  }
}

export default ArticleShow;
