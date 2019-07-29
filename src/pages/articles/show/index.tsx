import React from 'react';
import { Card, Icon, Spin, Tag, Row, Col } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import { Link } from 'umi';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { get } from 'lodash';
// @ts-ignore
import emojiToolkit from 'emoji-toolkit';
import marked from 'marked';
import Prism from 'prismjs';
import { showTime, dynamicLoad } from '@/utils/utils';
import Tocify from './tocify';
import { StateType } from './model';
import 'emoji-assets/sprites/joypixels-sprite-32.min.css';
import 'yt-simplemde-editor/dist/style.css';
import styles from './style.less';

const defaultQueryParams = {
  include: 'author,tags',
};

emojiToolkit.sprites = true;
emojiToolkit.spriteSize = 32;

interface ArticleShowState {
  dataLoaded: boolean;
}

interface ArticleShowProps extends FormComponentProps {
  dispatch: Dispatch<any>;
  loading: boolean;
  articlesShow: StateType;
  match: {
    params: { [K in 'id']: string };
  };
}

@connect(
  ({
    loading,
    articlesShow,
  }: {
    loading: { models: { [key: string]: boolean } };
    articlesShow: StateType;
  }) => ({
    loading: loading.models.articlesShow,
    articlesShow,
  }),
)
export default class ArticleShow extends React.Component<ArticleShowProps, ArticleShowState> {
  state: ArticleShowState = {
    dataLoaded: false,
  };

  markup = '';

  markdown: any;

  fetchArticlePromise?: Promise<any>;

  fetchArticleResolve: any;

  tocify: Tocify;

  constructor(props: ArticleShowProps) {
    super(props);

    this.state = {
      dataLoaded: false,
    };

    this.markup = '';

    this.tocify = new Tocify();
    const renderer = new marked.Renderer();
    renderer.heading = (text, level) => {
      const anchor = this.tocify.add(text, level);
      return `<a id=${anchor} class="anchor-fix"><h${level}>${text}</h${level}></a>\n`;
    };
    marked.setOptions({ renderer, breaks: true });
  }

  async componentWillMount() {
    const {
      dispatch,
      match: { params },
    } = this.props;
    dispatch({
      type: 'articlesShow/fetchArticle',
      id: params.id,
      payload: { ...defaultQueryParams },
    });

    this.fetchArticlePromise = new Promise(resolve => (this.fetchArticleResolve = resolve));
  }

  async componentDidMount() {
    await dynamicLoad('/fluidbox/jquery.min.js');
    await dynamicLoad('/fluidbox/jquery.ba-throttle-debounce.min.js');
    await dynamicLoad('/fluidbox/jquery.fluidbox.min.js');
    await dynamicLoad('/fluidbox/fluidbox.min.css');
    await this.fetchArticlePromise;

    this.setState({ dataLoaded: true }, () => {
      Prism.highlightAllUnder(this.markdown);

      /* eslint no-undef:0, func-names:0 */
      // @ts-ignore
      jQuery(this.markdown)
        .find('img')
        .each(function() {
          // @ts-ignore
          jQuery(this).wrap(`<a href="${jQuery(this).attr('src')}" class="fluidbox"></a>`);
        })
        .promise()
        // @ts-ignore
        .done(() => jQuery('a.fluidbox').fluidbox());
    });
  }

  componentDidUpdate(prevProps: ArticleShowProps) {
    if (prevProps.loading && this.props.loading === false) {
      this.fetchArticleResolve();
    }
  }

  componentWillUnmount() {
    const renderer = new marked.Renderer();
    marked.setOptions({ renderer, breaks: true });
  }

  setMarkdownRef = (ref: any) => {
    this.markdown = ref;
  };

  createMarkup() {
    const {
      articlesShow: { article },
      match: { params },
    } = this.props;
    if (!this.markup && article && article.content && String(article.id) === params.id) {
      this.tocify.reset();
      this.markup = emojiToolkit.toImage(marked(article.content));
    }
    return { __html: this.markup };
  }

  render() {
    const {
      articlesShow: { article },
      loading,
    } = this.props;
    const { dataLoaded } = this.state;

    return (
      <PageHeaderWrapper>
        <Row gutter={24} type="flex">
          <Col xl={18} lg={24} md={24} sm={24} xs={24}>
            <Card bordered={false}>
              <div className={styles.header}>
                <h1>{get(article, 'title')}</h1>
                <div className={styles.meta}>
                  <Link
                    style={{ color: 'inherit' }}
                    to={`/article/list?author_id=${get(article, 'author.id')}`}
                  >
                    {get(article, 'author.name')}
                  </Link>
                  <span style={{ margin: '0 6px' }}>⋅</span>
                  <span>
                    于
                    <Icon type="clock-circle-o" style={{ margin: '0 4px' }} />
                    {showTime(get(article, 'created_at', ''))}
                  </span>
                  <span style={{ margin: '0 6px' }}>⋅</span>
                  <span>
                    <Icon type="eye-o" style={{ marginRight: 4 }} />
                    {get(article, 'current_read_count')} 阅读
                  </span>
                  <span style={{ margin: '0 6px' }}>⋅</span>
                  <span>
                    <Icon type="tags-o" style={{ marginRight: 4 }} />
                    {article &&
                      article.tags &&
                      article.tags.map(tag => (
                        <Link key={tag.id} to={`/article/list?tags[0]=${tag.id}`}>
                          <Tag>{tag.name}</Tag>
                        </Link>
                      ))}
                  </span>
                </div>
              </div>
              {loading || !dataLoaded ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spin indicator={<Icon type="loading" style={{ fontSize: 32 }} spin />} />
                </div>
              ) : (
                <div
                  ref={this.setMarkdownRef}
                  className={`${styles.content} markdown-body`}
                  dangerouslySetInnerHTML={this.createMarkup()}
                />
              )}
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
            {this.markup && this.tocify.tocItems.length > 0 && this.tocify.render()}
          </Col>
        </Row>
      </PageHeaderWrapper>
    );
  }
}
