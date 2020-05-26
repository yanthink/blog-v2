import React, { useState } from 'react';
import { Link, useRequest } from 'umi';
import { PageHeaderWrapper, GridContent } from '@ant-design/pro-layout';
import { Button, Form, Card, List, Tag } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import Authorized from '@/utils/Authorized';
import { ConnectProps } from '@/models/connect';
import { IArticle, ITag, ResponseResultType } from '@/models/I';
import { scrollToAnchor, umiformatPaginationResult } from '@/utils/utils';
import { fetchAllTags } from '@/services';
import StandardFormRow from './components/StandardFormRow';
import TagSelect from './components/TagSelect';
import ArticleListContent from './components/ArticleListContent';
import * as services from './services';
import styles from './style.less';

interface ArticleListProps extends ConnectProps {}

interface FormDataType {
  tag_ids: (string | number)[];
}

const ArticleList: React.FC<ArticleListProps> = (props) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<FormDataType>({
    tag_ids: props.location.query.tag_ids,
  });
  const [isFirstRequest, setIsFirstRequest] = useState(true);

  // 获取全部标签
  const { data: allTags } = useRequest<ResponseResultType<ITag[]>>(fetchAllTags, {
    cacheKey: 'allTags',
  });
  // 获取文章列表数据
  const { loading, data, pagination } = useRequest<ResponseResultType<IArticle[]>, IArticle>(
    ({ current, pageSize }) => {
      return services.queryArticles({
        ...formData,
        q: props.location.query.q,
        include: 'tags',
        page: current,
        per_page: pageSize,
      });
    },
    {
      cacheKey: 'articleList',
      paginated: true,
      formatResult: umiformatPaginationResult,
      onSuccess() {
        if (!isFirstRequest) {
          scrollToAnchor('searchCard');
        } else {
          setIsFirstRequest(false);
        }
      },
      refreshDeps: [formData, props.location.query.q],
    },
  );

  const HeaderAction = (
    <Link to="/articles/create">
      <Button type="primary" icon={<PlusOutlined />}>
        新建文章
      </Button>
    </Link>
  );

  const title =
    !loading && props.location.query.q
      ? `关于 “${props.location.query.q}” 的搜索结果, 共 ${data?.total} 条`
      : '';

  const children = (
    <>
      <Card bordered={false} hidden={!!props.location.query.q} id="searchCard">
        <Form
          form={form}
          layout="inline"
          initialValues={{ initialValue: formData }}
          onValuesChange={(changedValues, { initialValue, ...values }) => {
            setFormData(values as FormDataType);
          }}
        >
          <StandardFormRow title="所属标签" block style={{ paddingBottom: 11 }}>
            <Form.Item name="tag_ids">
              <TagSelect expandable>
                {allTags?.map((tag) => (
                  // @ts-ignore
                  <TagSelect.Option value={tag.id} key={tag.id}>
                    {tag.name}
                  </TagSelect.Option>
                ))}
              </TagSelect>
            </Form.Item>
          </StandardFormRow>
        </Form>
      </Card>
      <Card className={styles.listCard} title={title} bordered={false}>
        <List
          className={styles.list}
          itemLayout="vertical"
          size="large"
          rowKey="id"
          loading={loading}
          dataSource={data?.list}
          pagination={{
            ...(pagination as any),
            responsive: true,
          }}
          split
          renderItem={(article: IArticle) => (
            <List.Item
              extra={
                <div className={styles.listItemExtra}>
                  {article.preview && <img src={article.preview} alt="预览" />}
                </div>
              }
              actions={[
                Authorized.check(
                  'articles.update',
                  <Link to={`/articles/${article.id}/edit`}>
                    <EditOutlined style={{ marginRight: 8 }} />
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
                    style={{ textDecoration: article.state ? 'none' : 'line-through' }}
                    to={`/articles/${article.id}`}
                  >
                    {article.highlights?.title
                      ? article.highlights.title.map((html, key) => (
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
                description={(article.tags as ITag[]).map((tag: ITag) => (
                  <Tag key={tag.id}>{tag.name}</Tag>
                ))}
              />
              <ArticleListContent data={article} />
            </List.Item>
          )}
        />
      </Card>
    </>
  );

  return (
    <>
      {Authorized.check(
        'articles.store',
        <PageHeaderWrapper extra={HeaderAction}>{children}</PageHeaderWrapper>,
        <GridContent>{children}</GridContent>,
      )}
    </>
  );
};

export default ArticleList;
