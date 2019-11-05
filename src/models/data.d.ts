export interface IUser {
  id?: number;
  username?: string;
  email?: string;
  wechat_openid?: string;
  has_password?: boolean;
  avatar?: string;
  gender?: 'male' | 'famale';
  bio?: string;
  settings?: {
    comment_email_notify?: boolean;
    like_email_notify?: boolean;
  };
  extends?: {
    country?: string;
    province?: string;
    city?: string;
    geographic?: object;
  };
  cache?: {
    unread_count?: number;
    articles_count?: number;
    comments_count?: number;
  };
  created_at?: string;
  updated_at?: string;
}

export interface IArticle {
  id?: number;
  user_id?: number;
  visible?: boolean;
  title?: string;
  preview?: string;
  cache?: {
    views_count?: number;
    favorites_count?: number;
    likes_count?: number;
    comments_count?: number;
  };
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  highlights?: {
    title?: string[];
    content?: string[];
  };
  created_at_timeago?: string;
  updated_at_timeago?: string;
  friendly_views_count?: string;
  friendly_comments_count?: string;
  friendly_likes_count?: string;
  has_liked?: boolean;
  has_favorited?: boolean;
  content?: IContent;
  user?: IUser;
  tags?: ITag[];
  comments?: IComment[];
}

export interface IComment {
  id?: number;
  commentable_type?: string;
  commentable_id?: number;
  user_id?: number;
  root_id?: number;
  parent_id?: number;
  popular?: number;
  cache?: {
    comments_count?: number;
    up_voters_count?: number;
    down_voters_count?: number;
  };
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  created_at_timeago?: string;
  updated_at_timeago?: string;
  friendly_comments_count?: string;
  friendly_up_voters_count?: string;
  friendly_down_voters_count?: string;
  content?: IContent;
  user?: IUser;
  children?: IComment[];
  meta?: IMeta;
}

export interface IContent {
  id?: number;
  contentable_type?: string;
  contentable_id?: number;
  body?: string;
  markdown?: string;
  combine_markdown?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface ITag {
  id?: number;
  name?: string;
  slug?: string;
  order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface INotification {
  id?: number;
  type?: string;
  notifiable_type?: string;
  notifiable_id?: number;
  data?: object;
  read_at?: string;
  created_at?: string;
  updated_at?: string;
  created_at_timeago?: string;
  notifiable?: IUser;
}

export interface IRole {
  id?: number;
  name?: string;
  display_name?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IPermission {
  id?: number;
  name?: string;
  guard_name?: string;
  display_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IFollowable {
  user_id?: number;
  followable_type?: string;
  followable_id?: number;
  relation?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  created_at_timeago?: string;
  followable?: IArticle | IComment;
}

export interface IMeta {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}
