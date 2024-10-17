import { z } from "zod";
import { Types } from "mongoose";
import { ExtendId } from "./common";
import { User } from "./user";
import { Disability } from "./disability";
import { countNonMarkdownCharacters } from "@/lib/utils";
import { MAX_POST_CONTENT_LEN, MAX_POST_TITLE_LEN } from "../consts";

export const postSchema = z.object({
  author: z.string().transform(id => new Types.ObjectId(id)),
  date: z.date().default(() => new Date()),
  title: z.string().max(
    MAX_POST_TITLE_LEN, 
    `Title must be at most ${MAX_POST_TITLE_LEN} characters.`
  ),
  content: z.string().refine(
    content => countNonMarkdownCharacters(content) <= MAX_POST_CONTENT_LEN,
    `Content must be at most ${MAX_POST_CONTENT_LEN} characters.`
  ),
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
export type PostSave = ExtendId<z.infer<typeof postSaveSchema>>;
export type PostLike = ExtendId<z.infer<typeof postLikeSchema>>;

export type PopulatedPost = Omit<Post, 'author' | 'tags'> & {
  author: User | null,
  tags: (Disability | null)[],
  liked: boolean
};

export type PostInput = z.input<typeof postSchema>;
export type PostSaveInput = z.input<typeof postSaveSchema>;
export type PostLikeInput = z.input<typeof postLikeSchema>;