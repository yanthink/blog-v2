import React from 'react';
import { Tag, Tooltip } from 'antd';
import { ClockCircleOutlined, EyeOutlined, TagsFilled } from '@ant-design/icons';
import { Link } from 'umi';
// @ts-ignore
import MarkdownBody from '@/components/MarkdownBody';
import LikeBtn from '@/components/Buttons/LikeBtn';
import FavoriteBtn from '@/components/Buttons/FavoriteBtn';
import Tocify from '@/components/MarkdownBody/tocify';
import { IArticle } from '@/models/I';
import styles from './style.less';

interface ArticleContentProps {
  article?: IArticle;
  getTocify?: (tocify: Tocify) => void;
  shouldUpdate?: boolean;
}

export default class ArticleContent extends React.Component<ArticleContentProps> {
  shouldComponentUpdate(nextProps: Readonly<ArticleContentProps>) {
    return !!nextProps.shouldUpdate;
  }

  render() {
    const { article } = this.props;

    if (!article?.content || !article.user) {
      return null;
    }

    return (
      <div className={styles.contentBox}>
        <div className={styles.header}>
          <h1>{article.title}</h1>
          <div className={styles.meta}>
            <a style={{ color: 'inherit' }}>{article.user.username}</a>
            <span style={{ margin: '0 6px' }}>⋅</span>
            <span>
              <ClockCircleOutlined style={{ margin: '0 4px' }} />
              <Tooltip title={article.created_at}>
                <span>{article.created_at_timeago}</span>
              </Tooltip>
            </span>
            <span style={{ margin: '0 6px' }}>⋅</span>
            <span>
              <EyeOutlined style={{ marginRight: 4 }} />
              {article.friendly_views_count} 阅读
            </span>
          </div>
        </div>

        <div className={styles.content}>
          <MarkdownBody
            markdown={article.content.combine_markdown!}
            prismPlugin
            toc
            getTocify={this.props.getTocify}
          />
        </div>

        <div className={styles.tags}>
          <TagsFilled style={{ marginRight: 12, fontSize: 16 }} />
          {article.tags?.map((tag) => (
            <Link key={tag.id} to={`/articles/list?tag_ids[0]=${tag.id}`}>
              <Tag color="orange">{tag.name}</Tag>
            </Link>
          ))}
        </div>

        <div className={styles.actions}>
          <LikeBtn relation="article" item={article} />
          <FavoriteBtn relation="article" item={article} hideText />
        </div>
      </div>
    );
  }
}
