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

  scrollToAnchor = (id: string) => {
    const dom = document.getElementById(id);
    dom && dom.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'start',
    });
  };

  queryList = async (params: object | string) => {
    const query = params instanceof Object ? params : parse(params.replace(/^\?/, ''));

    const queryParams = {
      ...defaultQueryParams,
      ...query,
    };

    await this.props.dispatch({
      type: 'articleList/fetch',
      payload: queryParams,
    });

    if (queryParams.page) {
      this.scrollToAnchor('searchForm');
    }
  };

  render () {
    const {
      form,
      articleList: { list, meta },
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

    const title = !loading && query && query.keyword
      ? `关于 “${query.keyword}” 的搜索结果, 共 ${meta.total} 条`
      : '';

    return (
      // @ts-ignore
      <PageHeaderWrapper extra={Authorized.check('articles.store', HeaderAction, null)}>
        <Card bordered={false} hidden={query && !!query.keyword} id="searchForm">
          <Form layout="inline">
            <StandardFormRow title="所属标签" block style={{ paddingBottom: 11 }}>
              <FormItem>
                {getFieldDecorator('tag_ids', {
                  initialValue: query.tag_ids,
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
            pagination={getAntdPaginationProps(meta, pathname, query)}
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
                ].filter(Boolean)}
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
