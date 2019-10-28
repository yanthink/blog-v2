import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Card, Button, Form, List, Tag, Icon } from 'antd';
import React, { Component } from 'react';
import { Link, router } from 'umi';
import { FormComponentProps } from 'antd/es/form';
import { connect } from 'dva';
import { get } from 'lodash';
import { parse, stringify } from 'qs';
import { ConnectState, ConnectProps, ArticleListModelState } from '@/models/connect';
import { IArticle, ITag } from '@/models/data';
import Authorized from '@/utils/Authorized';
import scrollToTop from '@/utils/scrollToTop';
import { getAntdPaginationProps } from '@/utils/XUtils';
import ArticleListContent from './components/ArticleListContent';
import StandardFormRow from './components/StandardFormRow';
import TagSelect from './components/TagSelect';
import * as services from './services';
import styles from './style.less';

const FormItem = Form.Item;

const defaultQueryParams = {
  include: 'user,tags',
};

interface ArticleListProps extends ConnectProps, FormComponentProps {
  articleList: ArticleListModelState;
  loading: boolean;
}

interface ArticleListState {
  allTags: ITag[];
}

let scrollToTopFlag = 0;

@connect(({ articleList, loading }: ConnectState) => ({
  articleList,
  loading: loading.models.articleList,
}))
class ArticleList extends Component<ArticleListProps, ArticleListState> {
  state: ArticleListState = {
    allTags: [],
  };

  async UNSAFE_componentWillMount () {
    this.queryList(this.props.location.search);

    const { data: allTags } = await services.queryAllTags();
    this.setState({ allTags });
  }

  UNSAFE_componentWillReceiveProps (nextProps: ArticleListProps) {
    if (nextProps.location.search !== this.props.location.search) {
      this.queryList(nextProps.location.search);
    }
  }

  componentDidUpdate (prevProps: ArticleListProps) {
    if (scrollToTopFlag === 2 && !this.props.loading) {
      scrollToTop(window, 150);
      scrollToTopFlag = 0;
    }

    if (
      prevProps.location.query.page !== this.props.location.query.page &&
      this.props.location.query.page
    ) {
      scrollToTopFlag = 1;
    }

    if (scrollToTopFlag === 1 && this.props.loading) {
      scrollToTopFlag = 2;
    }
  }

  queryList = (params: object | string) => {
    const query = params instanceof Object ? params : parse(params.replace(/^\?/, ''));

    const queryParams = {
      ...defaultQueryParams,
      ...query,
    };

    this.props.dispatch({
      type: 'articleList/fetch',
      payload: queryParams,
    });
  };

  render () {
    const {
      form,
      articleList: { list, pagination },
      loading,
      location: { pathname, search },
    } = this.props;
    const { getFieldDecorator } = form;
    const query = parse(search.replace(/^\?/, ''));

    const HeaderAction = (
      <Link to="/articles/create">
        <Button type="primary" icon="plus">
          新建文章
        </Button>
      </Link>
    );

    const title =
      !loading && query && query.keyword
        ? `关于 “${query.keyword}” 的搜索结果, 共 ${pagination.total} 条`
        : '';

    return (
      // @ts-ignore
      <PageHeaderWrapper extra={Authorized.check('create-article', HeaderAction, null)}>
        <Card bordered={false} hidden={query && !!query.keyword}>
          <Form layout="inline">
            <StandardFormRow title="所属标签" block style={{ paddingBottom: 11 }}>
              <FormItem>
                {getFieldDecorator('tags_id', {
                  initialValue: query.tags_id,
                })(
                  <TagSelect expandable>
                    {this.state.allTags.map(tag => (
                      <TagSelect.Option value={String(tag.id)} key={String(tag.id)}>
                        {tag.name}
                      </TagSelect.Option>
                    ))}
                  </TagSelect>,
                )}
              </FormItem>
            </StandardFormRow>
          </Form>
        </Card>
        <Card
          className={styles.listCard}
          title={title}
          bordered={false}
        >
          <List
            size="large"
            loading={loading}
            rowKey="id"
            itemLayout="vertical"
            dataSource={list}
            className={styles.list}
            pagination={getAntdPaginationProps(pagination, pathname, query)}
            renderItem={(article: IArticle) => (
              <List.Item
                key={article.id}
                extra={
                  <div className={styles.listItemExtra}>
                    {article.preview && <img src={article.preview} alt="预览" />}
                  </div>
                }
                actions={[
                  Authorized.check(
                    'articles.update',
                    <Link to={`/articles/${article.id}/edit`}>
                      <Icon type="edit" style={{ marginRight: 8 }} />
                      编辑
                    </Link>,
                    null,
                  ),
                ].filter(_ => _)}
              >
                <List.Item.Meta
                  title={
                    <Link
                      className={styles.listItemMetaTitle}
                      style={{
                        textDecoration: article.visible ? 'none' : 'line-through',
                      }}
                      to={`/articles/${article.id}`}
                    >
                      {
                        article.highlights && article.highlights.title
                          ? article.highlights.title.map((html, key) => (
                            <span
                              key={key}
                              dangerouslySetInnerHTML={{
                                __html: html,
                              }}
                            />
                          ))
                          : article.title
                      }
                    </Link>
                  }
                  description={(get(article, 'tags', []) as ITag[]).map((tag: ITag) => (
                    <Tag key={tag.id}>{tag.name}</Tag>
                  ))}
                />
                <ArticleListContent data={article} />
              </List.Item>
            )}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Form.create<ArticleListProps>({
  onValuesChange ({ location: { pathname } }: ArticleListProps, changedValues, allValues) {
    router.push({
      pathname,
      search: stringify({
        ...allValues,
      }),
    });
  },
})(ArticleList);
