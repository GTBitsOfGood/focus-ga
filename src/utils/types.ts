import { z } from "zod";
import { Types } from "mongoose";
import { ContentType, ReportReason } from "./constants";

export type ExtendId<T> = T & { _id: string };

// Post Types
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

// User Types
export const userSchema = z.object({
  username: z.string(),
  isAdmin: z.boolean().optional().default(false),
  lastName: z.string(),
  email: z.string().email(),
  childAge: z.number().min(0),
  childDisabilities: z.string().array().transform(ids => ids.map(id => new Types.ObjectId(id))),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string()
  })
});

export const editUserSchema = userSchema.partial();

// Disability types
export const disabilitySchema = z.object({
  name: z.string()
});

export const editDisabilitySchema = disabilitySchema.partial();

// Report types
export const reportSchema = z.object({
  reason: z.nativeEnum(ReportReason),
  description: z.string().optional(),
  date: z.date().optional().default(new Date()),
  isResolved: z.boolean().optional().default(false),
  reportedUser: z.string().transform(id => new Types.ObjectId(id)),
  sourceUser: z.string().transform(id => new Types.ObjectId(id)),
  reportedContent: z.string().transform(id => new Types.ObjectId(id)),
  contentType: z.nativeEnum(ContentType)
});

export const editReportSchema = reportSchema.partial();
