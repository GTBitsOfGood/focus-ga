export type ExtendId<T> = T & { _id: string };

import { z } from "zod";
import { Types } from "mongoose";

export const postSchema = z.object({
  author: z.string().transform(id => new Types.ObjectId(id)),
  date: z.date().default(() => new Date()),
  title: z.string(),
  content: z.string(),
  likes: z.number().default(0),
  tags: z.array(z.string()),
  isPinned: z.boolean().default(false),
  isPrivate: z.boolean().default(false),
  isFlagged: z.boolean().default(false),
});

export const editPostSchema = postSchema.partial();

export const postSaveSchema = z.object({
  post: z.string().transform(id => new Types.ObjectId(id)),
  user: z.string().transform(id => new Types.ObjectId(id)),
  date: z.date().default(() => new Date()),
});

export const postLikeSchema = z.object({
  post: z.string().transform(id => new Types.ObjectId(id)),
  user: z.string().transform(id => new Types.ObjectId(id)),
  date: z.date().default(() => new Date()),
});

export type Post = z.infer<typeof postSchema>;
export type PostSave = z.infer<typeof postSaveSchema>;
export type PostLike = z.infer<typeof postLikeSchema>;

export type PostInput = z.input<typeof postSchema>;
export type PostSaveInput = z.input<typeof postSaveSchema>;
export type PostLikeInput = z.input<typeof postLikeSchema>;