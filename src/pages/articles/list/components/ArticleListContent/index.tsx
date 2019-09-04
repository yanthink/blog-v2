import { Icon } from 'antd';
import React from 'react';
import { get } from 'lodash';
import Ellipsis from '@/components/Ellipsis';
import { IArticle } from '@/models/data';
import { showTime } from '@/utils/utils';
import styles from './index.less';

interface ArticleListContentProps {
  data: IArticle;
}

const IconText: React.FC<{
  type: string;
  text: React.ReactNode;
}> = ({ type, text }) => (
  <span style={{ marginRight: 16 }}>
    <Icon type={type} style={{ marginRight: 4 }} />
    {text}
  </span>
);

const ArticleListContent: React.FC<ArticleListContentProps> = ({ data: article }) => (
  <div className={styles.listContent}>
    <div className={styles.description}>
      <Ellipsis lines={3}>
        {article.highlight && article.highlight.content
          ? article.highlight.content.map((html, key) => (
            <span
              key={key}
              dangerouslySetInnerHTML={{
                __html: html,
              }}
            />
          ))
          : String(article.content).substr(0, 500)}
      </Ellipsis>
    </div>
    <div className={styles.extra}>
      <IconText type="user" text={get(article, 'author.name', '')} />
      <IconText type="clock-circle-o" text={showTime(article.updated_at || '')} />
      <IconText type="eye" text={article.current_read_count} />
      <IconText key="like" type="like-o" text={article.like_count} />
      <IconText type="message" key="message" text={article.comment_count} />
    </div>
  </div>
);

export default ArticleListContent;
