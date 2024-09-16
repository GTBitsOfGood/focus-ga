import { z } from "zod";
import { Types } from "mongoose";

export const commentSchema = z.object({
    author: z.string().transform(id => new Types.ObjectId(id)),
    post: z.string().transform(id => new Types.ObjectId(id)),
    date: z.date().optional().default(new Date()),
    content: z.string(),
    likes: z.number().optional().default(0),
    replyTo: z.string().transform(id => new Types.ObjectId(id)).optional(),
});

export const commentLikeSchema = z.object({
    comment: z.string().transform(id => new Types.ObjectId(id)),
    user: z.string().transform(id => new Types.ObjectId(id)),
    date: z.date().default(new Date()),
});

export type ExtendId<T> = T & { _id: string };