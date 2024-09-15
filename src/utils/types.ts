import { z } from "zod";
import { Types } from "mongoose";
import { ContentType, ReportReason } from "./constants";

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

export const disabilitySchema = z.object({
  name: z.string()
});

export const editDisabilitySchema = disabilitySchema.partial();

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

export type ExtendId<T> = T & { _id: string };