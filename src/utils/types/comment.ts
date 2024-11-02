import { z } from "zod";
import { Types } from "mongoose";
import { ExtendId } from "./common";
import { User } from "./user";

export const commentSchema = z.object({
  author: z.string().transform(id => new Types.ObjectId(id)),
  post: z.string().transform(id => new Types.ObjectId(id)),
  date: z.date().default(new Date()),
  content: z.string(),
  likes: z.number().default(0),
  replyTo: z.string().transform(id => new Types.ObjectId(id)).optional(),
  isDeleted: z.boolean().default(false)
});

export const commentLikeSchema = z.object({
  comment: z.string().transform(id => new Types.ObjectId(id)),
  user: z.string().transform(id => new Types.ObjectId(id)),
  date: z.date().default(new Date()),
});

export type Comment = ExtendId<z.infer<typeof commentSchema>>;
export type CommentLike = ExtendId<z.infer<typeof commentLikeSchema>>;

export type PopulatedComment = Omit<Comment, 'author' | 'post' | 'replyTo'> & {
  author: User | null,
  post: string,
  replyTo: string | null,
  liked: boolean
};

export type CommentInput = z.input<typeof commentSchema>;
export type CommentLikeInput = z.input<typeof commentLikeSchema>;
