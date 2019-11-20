import React from 'react';
import { Card, Row, Col, Button, Skeleton, message } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { connect } from 'dva';
import { Link } from 'umi';
import { debounce } from 'lodash';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import Authorized from '@/utils/Authorized';
import Tocify from '@/components/MarkdownBody/tocify';
import { ConnectState, ConnectProps, Loading, ArticleShowModelState } from '@/models/connect';
import ArticleContent from './components/ArticleContent';
import ArticleComments from './components/ArticleComments';
import styles from './style.less';

const defaultArticleQueryParams = {
  include: 'user,tags',
};

const defaultCommentsQueryParams: {
  include: string;
  root_id: number;
  top_comment?: number;
} = {
  include: 'user,children.user,children.parent.user',
  root_id: 0,
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
  renderComments: boolean;
  tocify?: Tocify;
}

@connect(({ loading, articleShow }: ConnectState) => ({
  loading,
  articleShow,
}))
class ArticleShow extends React.Component<ArticleShowProps, ArticleShowState> {
  constructor (props: ArticleShowProps) {
    super(props);

    this.state = {
      fetchingArticle: true,
      renderComments: false,
      tocify: undefined,
    };
  }

  async UNSAFE_componentWillMount () {
    const { dispatch, match: { params }, location } = this.props;

    const fetchArticle = dispatch({
      type: 'articleShow/fetchArticle',
      id: params.id,
      payload: {
        ...defaultArticleQueryParams,
        ...location.query,
      },
    });

    delete defaultCommentsQueryParams.top_comment;
    if (this.props.location.hash) {
      const arr = this.props.location.hash.split('-');

      if (arr.length === 2 && arr[0] === '#comment' && arr[1] !== undefined && Number(arr[1]) > 0) {
        defaultCommentsQueryParams.top_comment = Number(arr[1]);
      }
    }

    const fetchComments = dispatch({
      type: 'articleShow/fetchComments',
      article_id: params.id,
      payload: {
        ...defaultCommentsQueryParams,
      },
    });

    await fetchArticle;
    this.setState({ fetchingArticle: false });
    await fetchComments;

    // 文章内容渲染完成后再渲染评论来提升渲染速度
    setTimeout(() => {
      this.setState({ renderComments: true }, () => {
        if (this.props.location.hash) {
          setTimeout(() => this.scrollToAnchor(this.props.location.hash.substr(1)), 200);
        }
      });
    }, 0);
  }

  scrollToAnchor = (id: string) => {
    const dom = document.getElementById(id);
    dom && dom.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'start',
    });
  };

  handleSubmitComment = debounce(async (values, callback?: () => void) => {
    const { dispatch, match: { params } } = this.props;

    await dispatch({
      type: 'articleShow/submitComment',
      article_id: params.id,
      payload: {
        ...defaultCommentsQueryParams,
        ...values,
      },
    });

    message.success('评论成功！');
    callback && callback();
  }, 600);

  handleCommentsPageChange = debounce(async (page: number) => {
    const { dispatch, match: { params } } = this.props;

    await dispatch({
      type: 'articleShow/fetchComments',
      article_id: params.id,
      payload: {
        ...defaultCommentsQueryParams,
        page,
      },
    });

    this.scrollToAnchor('comments');
  }, 200);

  handleFetchMoreChildrenComments = debounce(async (comment_id: number) => {
    const { dispatch, match: { params } } = this.props;

    const hide = message.loading('正在请求...', 0);

    await dispatch({
      type: 'articleShow/appendFetchChildrenComments',
      article_id: params.id,
      comment_id,
      payload: {
        include: 'user,parent.user',
      },
    });

    hide();
  }, 200);

  setTocify = (tocify: Tocify) => {
    tocify.add('评论', 1, 'comments');
    this.setState({ tocify });
  };

  render () {
    const {
      articleShow: { article, comments, meta },
      match: { params },
      loading,
    } = this.props;

    const { fetchingArticle, renderComments, tocify } = this.state;

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

            <Card bordered={false} style={{ marginTop: 24 }} id="comments">
              {
                renderComments &&
                <ArticleComments
                  article={article}
                  comments={comments}
                  meta={meta}
                  loading={loading.effects['articleShow/fetchComments']}
                  onPageChange={this.handleCommentsPageChange}
                  onFetchMoreChildrenComments={this.handleFetchMoreChildrenComments}
                  onSubmitComment={this.handleSubmitComment}
                  submittingComment={loading.effects['articleShow/submitComment']}
                  topComment={defaultCommentsQueryParams.top_comment}
                />
              }
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
