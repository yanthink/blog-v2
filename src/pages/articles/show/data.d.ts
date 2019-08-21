import { UserType } from '@/models/user';
import { PaginationType } from '../list/data';

export interface CommentType {
  id?: number;
  user_id?: number;
  content?: string;
  target_type?: string;
  target_id?: number;
  reply_count?: number;
  like_count?: number;
  created_at?: string;
  user?: UserType;
  replys?: ReplyType[];
  likes?: LikeType[],
  replysPagination?: Partial<PaginationType>;
}

export interface ReplyType {
  id?: number;
  user_id?: number;
  content?: string;
  target_type?: string;
  target_id?: number;
  parent_id?: number;
  like_count?: number;
  created_at?: string;
  user?: UserType;
  parent?: ReplyType | null;
  likes?: LikeType[],
}

export interface LikeType {
  id?: number;
  user_id?: number;
  target_type?: string;
  target_id?: number;
  created_at?: string;
  updated_at?: string;
}
