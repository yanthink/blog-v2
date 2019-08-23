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
}

export interface ITag {
  id?: number;
  name?: string;
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
}

export interface IFavorites {
  id?: number;
  user_id?: number;
  target_type?: string;
  target_id?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface IPagination {
  total?: number;
  pageSize?: number;
  current?: number;
}
