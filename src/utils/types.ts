import { z } from "zod";
import { Types } from "mongoose";

export const userSchema = z.object({
  username: z.string(),
  isAdmin: z.boolean().default(false),
  lastName: z.string(),
  email: z.string().email(),
  childAge: z.number().min(0),
  childDisabilities: z.instanceof(Types.ObjectId).array(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string()
  })
});

export const editUserSchema = userSchema.partial();

export const disabilitySchema = z.object({
  name: z.string()
});

export const editDisabilitySchema = disabilitySchema.partial();

export const reportSchema = z.object({
  reason: z.enum(['Spam', 'Inappropriate', 'Harassment', 'Other']),
  description: z.string().optional(),
  date: z.date(),
  isResolved: z.boolean().default(false),
  reportedUser: z.instanceof(Types.ObjectId),
  sourceUser: z.instanceof(Types.ObjectId),
  reportedContent: z.instanceof(Types.ObjectId),
  contentType: z.enum(['User', 'Comment', 'Post'])
});

export const editReportSchema = reportSchema.partial();

export type ExtendId<T> = T & { _id: string };