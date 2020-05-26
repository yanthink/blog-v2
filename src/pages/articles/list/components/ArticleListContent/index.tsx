import React from 'react';
import { Tooltip } from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  LikeOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import Ellipsis from '@/components/Ellipsis';
import { IArticle } from '@/models/I';
import styles from './index.less';

interface ArticleListContentProps {
  data: IArticle;
}

const ArticleListContent: React.FC<ArticleListContentProps> = ({ data: article }) => (
  <div className={styles.listContent}>
    <div className={styles.description}>
      <Ellipsis lines={3}>
        {article.highlights?.content
          ? article.highlights.content.map((html, key) => (
              <span
                key={key}
                dangerouslySetInnerHTML={{
                  __html: html,
                }}
              />
            ))
          : article.content?.combine_markdown?.substr(0, 300)}
      </Ellipsis>
    </div>
    <div className={styles.extra}>
      <span style={{ marginRight: 16 }}>
        <UserOutlined style={{ marginRight: 4 }} />
        {article.user?.username}
      </span>
      <Tooltip title={article.created_at}>
        <span style={{ marginRight: 16 }}>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {article.created_at_timeago}
        </span>
      </Tooltip>
      <span style={{ marginRight: 16 }}>
        <EyeOutlined style={{ marginRight: 4 }} />
        {article.friendly_views_count}
      </span>
      <span style={{ marginRight: 16 }}>
        <LikeOutlined style={{ marginRight: 4 }} />
        {article.friendly_likes_count}
      </span>
      <span style={{ marginRight: 16 }}>
        <MessageOutlined style={{ marginRight: 4 }} />
        {article.friendly_comments_count}
      </span>
    </div>
  </div>
);

export default ArticleListContent;
