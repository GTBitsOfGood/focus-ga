import { z } from "zod";
import { Types } from "mongoose";
import { ExtendId } from "./common";

export const commentSchema = z.object({
  author: z.string().transform(id => new Types.ObjectId(id)),
  post: z.string().transform(id => new Types.ObjectId(id)),
  date: z.date().default(new Date()),
  content: z.string(),
  likes: z.number().default(0),
  replyTo: z.string().transform(id => new Types.ObjectId(id)).optional(),
});

export const commentLikeSchema = z.object({
  comment: z.string().transform(id => new Types.ObjectId(id)),
  user: z.string().transform(id => new Types.ObjectId(id)),
  date: z.date().default(new Date()),
});

export type Comment = ExtendId<z.infer<typeof commentSchema>>;
export type CommentLike = ExtendId<z.infer<typeof commentLikeSchema>>;

export type CommentInput = z.input<typeof commentSchema>;
export type CommentLikeInput = z.input<typeof commentLikeSchema>;
