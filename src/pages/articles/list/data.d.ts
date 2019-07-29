import { UserType } from '@/models/user';

export interface ArticleType {
  id?: number;
  status?: boolean;
  title?: string;
  preview?: string;
  content?: string;
  author_id?: number;
  comment_count?: number;
  read_count?: number;
  like_count?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  highlight?: {
    title?: string[];
    content?: string[];
  };
  author?: UserType;
  tags?: TagType[];
}

export interface PaginationType {
  total: number;
  pageSize: number;
  current: number;
}

export interface TagType {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface QueryParamsType {
  include: string;
  page: number;
  pageSize: number;
  tagIds: [];
}
