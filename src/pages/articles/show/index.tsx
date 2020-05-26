import React, { useEffect, useState } from 'react';
import { useRequest } from 'umi';
import { GridContent } from '@ant-design/pro-layout';
import { Card, Row, Col, Skeleton, message } from 'antd';
import { unionBy } from 'lodash';
import { ConnectProps } from '@/models/connect';
import Tocify from '@/components/MarkdownBody/tocify';
import { IArticle, IComment, ResponseResultType } from '@/models/I';
import { scrollToAnchor, umiformatPaginationResult } from '@/utils/utils';
import ArticleContent from './components/ArticleContent';
import ArticleComments from './components/ArticleComments';
import * as services from './services';
import styles from './style.less';

interface ArticleShowProps extends ConnectProps<{ id: string }> {}

let topComment: number | string | undefined;

const ArticleShow: React.FC<ArticleShowProps> = (props) => {
  const [tocify, setTocify] = useState<Tocify>();
  const [isFirstRequest, setIsFirstRequest] = useState(true);

  const id = props.match?.params.id!;

  // 获取文章数据
  const { loading, data: article } = useRequest<ResponseResultType<IArticle>>(() =>
    services.queryArticle(id, { include: 'user,tags' }),
  );
  // 获取评论列表
  const {
    loading: commentsLoading,
    data: comments,
    pagination,
    run: queryComments,
    mutate: commentsMutate,
  } = useRequest<ResponseResultType<IComment[]>, IComment>(
    ({ current, pageSize }) =>
      services.queryArticleComments(id, {
        top_comment: topComment,
        include: 'user,children.user,children.parent.user',
        root_id: 0,
        page: current,
        per_page: pageSize,
      }),
    {
      manual: true,
      paginated: true,
      formatResult: umiformatPaginationResult,
      onSuccess() {
        if (!isFirstRequest) {
          scrollToAnchor('commentsCard');
        } else {
          setIsFirstRequest(false);
        }
      },
    },
  );
  // submit评论
  const { loading: submittingComment, run: storeArticleComment } = useRequest<
    ResponseResultType<IComment>
  >(services.storeArticleComment, {
    manual: true,
    onSuccess(data) {
      if (data.parent_id && data.root_id) {
        const parentComment = comments!.list.find((comment) => comment.id === data.root_id);
        if (parentComment) {
          parentComment.cache!.comments_count!++;
          const index = parentComment.children!.findIndex(
            (comment) => comment.id === data.parent_id,
          );
          parentComment.children!.splice(index + 1, 0, data);
        }
      } else {
        comments!.list.unshift(data);
      }
      commentsMutate(comments);
      message.success('评论成功！');
    },
  });
  // 获取更多子评论
  const { run: appendFetchChildrenComments } = useRequest<
    ResponseResultType<IComment[]>,
    [number | string, { root_id: number; include: string }]
  >(services.queryArticleComments, {
    manual: true,
    throttleInterval: 600,
    onSuccess(data, [, { root_id }]) {
      const parentComment = comments!.list.find((comment) => comment.id === root_id);
      if (parentComment) {
        parentComment.children = unionBy(
          (parentComment.children || []).concat(data.list),
          'id',
        ) as IComment[];
        parentComment.meta = data.meta;
        commentsMutate(comments);
      }
    },
    formatResult: umiformatPaginationResult,
  });

  useEffect(() => {
    topComment = undefined;
    if (props.location.hash) {
      const arr = props.location.hash.split('-');
      if (arr.length === 2 && arr[0] === '#comment' && arr[1] !== undefined && Number(arr[1]) > 0) {
        topComment = Number(arr[1]);
      }
    }
    queryComments({ current: 1, pageSize: 10 }).then(() => {
      if (props.location.hash) {
        setTimeout(() => scrollToAnchor(props.location.hash.substr(1)), 200);
      }
    });
    topComment = undefined;
  }, []);

  async function handleSubmitComment(values: object) {
    await storeArticleComment(id, {
      ...values,
      include: 'user,children.user,children.parent.user',
    });
  }

  async function handleFetchMoreChildrenComments(comment_id: number) {
    const hide = message.loading('正在请求...', 0);
    await appendFetchChildrenComments(id, { root_id: comment_id, include: 'user,parent.user' });
    hide();
  }

  return (
    <GridContent>
      <Row gutter={24}>
        <Col xl={18} lg={24} md={24} sm={24} xs={24}>
          <Card bordered={false}>
            <Skeleton active paragraph={{ rows: 13 }} loading={loading}>
              <ArticleContent
                article={article}
                shouldUpdate={false}
                getTocify={(tocInstance) => {
                  tocInstance.add('评论', 1, 'commentsCard');
                  setTocify(tocInstance);
                }}
              />
            </Skeleton>
          </Card>
          <Card bordered={false} style={{ marginTop: 24 }} id="commentsCard">
            <ArticleComments
              article={article!}
              comments={comments?.list!}
              pagination={{
                ...(pagination as any),
                responsive: true,
              }}
              loading={commentsLoading}
              onFetchMoreChildrenComments={handleFetchMoreChildrenComments}
              onSubmit={handleSubmitComment}
              submittingComment={submittingComment}
              topComment={topComment as number}
            />
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
            <Skeleton active paragraph={{ rows: 10 }} loading={!tocify}>
              {tocify?.render()}
            </Skeleton>
          </div>
        </Col>
      </Row>
    </GridContent>
  );
};

export default ArticleShow;
