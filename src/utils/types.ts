import { z } from "zod";
import { Types } from "mongoose";

export const commentSchema = z.object({
    author: z.instanceof(Types.ObjectId),
    post: z.instanceof(Types.ObjectId),
    date: z.date().default(new Date()),
    content: z.string(),
    likes: z.number().default(0),
    replyTo: z.instanceof(Types.ObjectId).nullable().default(null),
});

export const commentLikeSchema = z.object({
    comment: z.instanceof(Types.ObjectId),
    user: z.instanceof(Types.ObjectId),
    date: z.date().default(new Date()),
});

export type ExtendId<T> = T & { _id: string };