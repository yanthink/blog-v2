import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Card, Button, Form, List, Tag, Icon } from 'antd';
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { Link, withRouter, router } from 'umi';
import { FormComponentProps } from 'antd/es/form';
import { connect } from 'dva';
import { get } from 'lodash';
import { parse, stringify } from 'qs';
import ArticleListContent from './components/ArticleListContent';
import { StateType } from './model';
import { ArticleType, TagType } from './data.d';
import StandardFormRow from './components/StandardFormRow';
import TagSelect from './components/TagSelect';
import scrollToTop from './utils/scrollToTop';
import { queryAllTags } from './service';
import Authorized from '@/utils/Authorized';
import styles from './style.less';

const FormItem = Form.Item;

const defaultQueryParams = {
  include: 'author,tags',
};

interface ArticleListProps extends FormComponentProps {
  dispatch: Dispatch<any>;
  articlesList: StateType;
  loading: boolean;
  location: {
    pathname: string;
    query: { [key: string]: string };
    search: string;
  };
}

interface ArticleListState {
  allTags: TagType[];
}

let scrollToTopFlag = 0;

class ArticleList extends Component<ArticleListProps, ArticleListState> {
  state: ArticleListState = {
    allTags: [],
  };

  async componentWillMount() {
    this.queryList(this.props.location.search);

    const { data: allTags } = await queryAllTags();
    this.setState({ allTags });
  }

  componentWillReceiveProps(nextProps: Readonly<ArticleListProps>): void {
    if (nextProps.location.search !== this.props.location.search) {
      this.queryList(nextProps.location.search);
    }
  }

  componentDidUpdate(prevProps: Readonly<ArticleListProps>) {
    if (scrollToTopFlag === 2 && !this.props.loading) {
      scrollToTop(window, 174);
      scrollToTopFlag = 0;
    }

    if (prevProps.location.query.page !== this.props.location.query.page) {
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
      type: 'articlesList/fetch',
      payload: queryParams,
    });
  };

  render() {
    const {
      form,
      articlesList: { list, pagination },
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
      <PageHeaderWrapper extra={Authorized.check('articles.store', HeaderAction, null)}>
        <Card bordered={false} hidden={query && !!query.keyword}>
          <Form layout="inline">
            <StandardFormRow title="所属类目" block style={{ paddingBottom: 11 }}>
              <FormItem>
                {getFieldDecorator('tagIds', {
                  initialValue: query.tagIds,
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
          title={title}
          style={{ marginTop: 24 }}
          bordered={false}
          bodyStyle={{ padding: '8px 32px 32px 32px' }}
        >
          <List
            size="large"
            loading={list.length === 0 ? loading : false}
            rowKey="id"
            itemLayout="vertical"
            dataSource={list}
            className={styles.list}
            pagination={{
              ...pagination,
              itemRender(page, type, originalElement) {
                return (
                  // @ts-ignore
                  <Link
                    {...originalElement.props}
                    to={`${pathname}?${stringify({ ...query, page })}`}
                  >
                    {type === 'page' && page}
                  </Link>
                );
              },
            }}
            renderItem={(article: ArticleType) => (
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
                        textDecoration: article.status ? 'none' : 'line-through',
                      }}
                      to={`/articles/${article.id}/show`}
                    >
                      {article.highlight && article.highlight.title
                        ? article.highlight.title.map((html, key) => (
                            <span
                              key={key}
                              dangerouslySetInnerHTML={{
                                __html: html,
                              }}
                            />
                          ))
                        : article.title}
                    </Link>
                  }
                  description={(get(article, 'tags', []) as TagType[]).map((tag: TagType) => (
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

const WarpForm = Form.create<ArticleListProps>({
  onValuesChange({ location: { pathname, search } }: ArticleListProps, changedValues, allValues) {
    const query = parse(search.substr(1));

    router.push({
      pathname,
      search: stringify({
        ...query,
        ...allValues,
        page: 1,
      }),
    });
  },
})(ArticleList);

export default withRouter(
  connect(
    ({
      articlesList,
      loading,
    }: {
      articlesList: StateType;
      loading: { models: { [key: string]: boolean } };
    }) => ({
      articlesList,
      loading: loading.models.articlesList,
    }),
  )(WarpForm),
);
