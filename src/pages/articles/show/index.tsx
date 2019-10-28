import React from 'react';
import { Card, Row, Col, Button, Skeleton, message } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { connect } from 'dva';
import { Link } from 'umi';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import Authorized from '@/utils/Authorized';
import Tocify from '@/components/MarkdownBody/tocify';
import { ConnectState, ConnectProps, Loading, ArticleShowModelState } from '@/models/connect';
import scrollToTop from '@/utils/scrollToTop';
import { getPositions } from '@/utils/utils';
import ArticleContent from './components/ArticleContent';
import ArticleComments from './components/ArticleComments';
import styles from './style.less';

const defaultArticleQueryParams = {
  include: 'user,tags',
};

const defaultCommentsQueryParams = {
  include: 'user,children.user',
  parent_id: 0,
  root_id: 0,
  append: 'has_up_voted,has_down_voted',
};

interface ArticleShowProps extends ConnectProps, FormComponentProps {
  loading: Loading;
  articleShow: ArticleShowModelState;
  match: ConnectProps['match'] & {
    params: { [K in 'id']: string };
  };
}

interface ArticleShowState {
  fetchingArticle: boolean;
  tocify?: Tocify;
}

@connect(({ loading, articleShow }: ConnectState) => ({
  loading,
  articleShow,
}))
class ArticleShow extends React.Component<ArticleShowProps, ArticleShowState> {
  state: ArticleShowState = {
    fetchingArticle: true,
  };

  commentsPageChanged?: boolean;

  commentsBody?: HTMLDivElement;

  constructor (props: ArticleShowProps) {
    super(props);

    this.state = {
      fetchingArticle: true,
    };
  }

  async UNSAFE_componentWillMount () {
    const { dispatch, match: { params }, location } = this.props;

    dispatch({
      type: 'articleShow/fetchArticle',
      id: params.id,
      payload: {
        ...defaultArticleQueryParams,
        ...location.query,
      },
    });

    dispatch({
      type: 'articleShow/fetchComments',
      article_id: params.id,
      payload: {
        ...defaultCommentsQueryParams,
      },
    });
  }

  componentDidUpdate (prevProps: ArticleShowProps) {
    /* eslint react/no-did-update-set-state:0 */
    if (
      prevProps.loading.effects['articleShow/fetchArticle'] &&
      this.props.loading.effects['articleShow/fetchArticle'] === false
    ) {
      this.setState({ fetchingArticle: false });
    }

    if (
      this.commentsPageChanged &&
      prevProps.loading.effects['articleShow/fetchComments'] &&
      this.props.loading.effects['articleShow/fetchComments'] === false
    ) {
      scrollToTop(window, getPositions(this.commentsBody as HTMLDivElement).top - 24);
    }
  }

  handleSubmitComment = (values: { content: { markdown: string }, parent_id: number }, callback?: () => void) => {
    const { dispatch, match: { params } } = this.props;

    dispatch({
      type: 'articleShow/submitComment',
      article_id: params.id,
      payload: {
        ...defaultCommentsQueryParams,
        ...values,
      },
      callback () {
        message.success('评论成功！');
        if (callback) {
          callback();
        }
      },
    });
  };

  handleCommentsPageChange = (page: number) => {
    const { dispatch, match: { params } } = this.props;

    dispatch({
      type: 'articleShow/fetchComments',
      article_id: params.id,
      payload: {
        ...defaultCommentsQueryParams,
        page,
      },
    });

    this.commentsPageChanged = true;
  };

  setTocify = (tocify: Tocify) => {
    tocify.add('评论', 1, 'comments');
    this.setState({ tocify });
  };

  setCommentsRef = (ref: HTMLDivElement) => {
    this.commentsBody = ref;
  };

  render () {
    const {
      articleShow: { article, comments, pagination },
      match: { params },
      loading,
    } = this.props;

    const { fetchingArticle, tocify } = this.state;

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
              </Skeleton>
            </Card>

            <Card bordered={false} style={{ marginTop: 24 }}>
              <div ref={this.setCommentsRef} id="comments">
                <ArticleComments
                  article={article}
                  comments={comments}
                  pagination={pagination}
                  loading={loading.effects['articleShow/fetchComments']}
                  onPageChange={this.handleCommentsPageChange}
                  onSubmitComment={this.handleSubmitComment}
                  submittingComment={loading.effects['articleShow/submitComment']}
                />
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
