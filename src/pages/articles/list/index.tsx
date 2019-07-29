import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Card, Button, Form, List, Tag, Icon } from 'antd';
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { Link, withRouter } from 'umi';
import { FormComponentProps } from 'antd/es/form';
import { connect } from 'dva';
import { get } from 'lodash';
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
    query: { [key: string]: string };
    search: string;
  };
}

interface ArticleListState {
  allTags: TagType[];
}

class ArticleList extends Component<ArticleListProps, ArticleListState> {
  state: ArticleListState = {
    allTags: [],
  };

  async componentWillMount() {
    this.queryList();
    const { data: allTags } = await queryAllTags();
    this.setState({ allTags });
  }

  componentDidUpdate({ articlesList, location }: ArticleListProps) {
    if (location.search !== this.props.location.search) {
      this.queryList();
    }

    if (articlesList.pagination.current !== this.props.articlesList.pagination.current) {
      scrollToTop(window, 174);
    }
  }

  queryList = (pagination?: { page?: number; pageSize?: number }) => {
    const {
      dispatch,
      form: { getFieldsValue },
      location: { query },
    } = this.props;
    const values = getFieldsValue();

    const queryParams = {
      ...defaultQueryParams,
      ...query,
      ...pagination,
      ...values,
    };

    dispatch({
      type: 'articlesList/fetch',
      payload: queryParams,
    });
  };

  handelPaginationChange = (page: number, pageSize?: number) => {
    const {
      articlesList: { pagination },
    } = this.props;
    this.queryList({ ...pagination, page, pageSize });
  };

  render() {
    const {
      form,
      articlesList: { list, pagination },
      loading,
      location: { query },
    } = this.props;
    const { getFieldDecorator } = form;

    const HeaderAction = (
      <Link to="/articles/create">
        <Button type="primary" icon="plus">
          新建文章
        </Button>
      </Link>
    );

    const title =
      query && query.keyword ? `关于 “${query.keyword}” 的搜索结果, 共 ${pagination.total} 条` : '';

    return (
      // @ts-ignore
      <PageHeaderWrapper extra={Authorized.check('articles.store', HeaderAction, null)}>
        <Card bordered={false} hidden={query && !!query.keyword}>
          <Form layout="inline">
            <StandardFormRow title="所属类目" block style={{ paddingBottom: 11 }}>
              <FormItem>
                {getFieldDecorator('tagIds')(
                  <TagSelect expandable>
                    {this.state.allTags.map(tag => (
                      <TagSelect.Option value={tag.id} key={tag.id}>
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
              onChange: this.handelPaginationChange,
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
  onValuesChange(
    { dispatch, articlesList: { pagination } }: ArticleListProps,
    changedValues,
    allValues,
  ) {
    const queryParams = {
      ...defaultQueryParams,
      ...pagination,
      ...allValues,
    };

    dispatch({
      type: 'articlesList/fetch',
      payload: queryParams,
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
