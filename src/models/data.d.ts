export interface IUser {
  id?: number;
  name?: string;
  email?: string;
  user_info?: {
    city?: string;
    gender?: number;
    country?: string;
    language?: string;
    nickName?: string;
    province?: string;
    avatarUrl?: string;
    signature?: string;
  };
  created_at?: string;
  updated_at?: string;
  unread_count?: number;
  has_password?: boolean;
}

export interface IArticle {
  id?: number;
  status?: boolean;
  title?: string;
  preview?: string;
  content?: string;
  author_id?: number;
  comment_count?: number;
  read_count?: number;
  current_read_count?: number;
  like_count?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  highlight?: {
    title?: string[];
    content?: string[];
  };
  author?: IUser;
  tags?: ITag[];
  likes?: ILike[];
  favorites?: IFavorite[];
}

export interface ITag {
  id?: number;
  name?: string;
  order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface IComment {
  id?: number;
  user_id?: number;
  content?: string;
  target_type?: string;
  target_id?: number;
  reply_count?: number;
  like_count?: number;
  created_at?: string;
  user?: IUser;
  target?: IArticle;
  replys?: IReply[];
  likes?: ILike[],
  replysPagination?: IPagination;
}

export interface IReply {
  id?: number;
  user_id?: number;
  content?: string;
  target_type?: string;
  target_id?: number;
  parent_id?: number;
  like_count?: number;
  created_at?: string;
  user?: IUser;
  target?: IComment;
  parent?: IReply | null;
  likes?: ILike[],
}

export interface ILike {
  id?: number;
  user_id?: number;
  target_type?: string;
  target_id?: number;
  created_at?: string;
  updated_at?: string;
  target?: IArticle | IComment | IReply;
}

export interface IFavorite {
  id?: number;
  user_id?: number;
  target_type?: string;
  target_id?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  target?: IArticle;
}

export interface INotification {
  id?: number;
  type?: string;
  notifiable_type?: string;
  notifiable_id?: number;
  data?: {
    content?: string;
    form_id?: number;
    target_id?: number;
    comment_id?: number;
    target_name?: number;
    form_user_id?: number;
    form_user_name?: string;
    form_user_avatar?: string;
  };
  read_at?: string;
  created_at?: string;
  updated_at?: string;
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

export interface IPagination {
  total?: number;
  pageSize?: number;
  current?: number;
}
