import { z } from "zod";
import { Types } from "mongoose";
import { ExtendId } from "./common";
import { User } from "./user";
import { Disability } from "./disability";

export const postSchema = z.object({
  author: z.string().transform(id => new Types.ObjectId(id)),
  date: z.date().default(() => new Date()),
  title: z.string(),
  content: z.string(),
  likes: z.number().default(0),
  comments: z.number().default(0),
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

export type Post = ExtendId<z.infer<typeof postSchema>>;
export type PopulatedPost = Omit<Post, 'author' | 'tags'> & { author: User | null, tags: (Disability | null)[] };
export type PostSave = ExtendId<z.infer<typeof postSaveSchema>>;
export type PostLike = ExtendId<z.infer<typeof postLikeSchema>>;

export type PostInput = z.input<typeof postSchema>;
export type PostSaveInput = z.input<typeof postSaveSchema>;
export type PostLikeInput = z.input<typeof postLikeSchema>;