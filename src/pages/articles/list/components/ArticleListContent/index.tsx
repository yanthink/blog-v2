import { Icon, Tooltip } from 'antd';
import React from 'react';
import { get } from 'lodash';
import Ellipsis from '@/components/Ellipsis';
import { IArticle } from '@/models/data';
import styles from './index.less';

interface ArticleListContentProps {
  data: IArticle;
}

const IconText: React.FC<{
  type: string;
  text: React.ReactNode;
  tooltip?: string;
}> = ({ type, text, tooltip }) => {
  if (tooltip) {
    return (
      <Tooltip title={tooltip}>
        <span style={{ marginRight: 16 }}>
          <Icon type={type} style={{ marginRight: 4 }} />
          {text}
        </span>
      </Tooltip>
    );
  }

  return (
    <span style={{ marginRight: 16 }}>
      <Icon type={type} style={{ marginRight: 4 }} />
      {text}
    </span>
  );
};

const ArticleListContent: React.FC<ArticleListContentProps> = ({ data: article }) => (
  <div className={styles.listContent}>
    <div className={styles.description}>
      <Ellipsis lines={3}>
        {article.highlights && article.highlights.content
          ? article.highlights.content.map((html, key) => (
            <span
              key={key}
              dangerouslySetInnerHTML={{
                __html: html,
              }}
            />
          ))
          : get(article, 'content.markdown', '').substr(0, 300)}
      </Ellipsis>
    </div>
    <div className={styles.extra}>
      <IconText type="user" text={get(article, 'author.name', '')} />
      <IconText type="clock-circle-o" text={article.created_at_timeago} tooltip={article.created_at} />
      <IconText type="eye" text={article.friendly_views_count} />
      <IconText key="like" type="like-o" text={article.friendly_likes_count} />
      <IconText type="message" key="message" text={article.friendly_comments_count} />
    </div>
  </div>
);

export default ArticleListContent;
