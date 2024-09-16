import { z } from "zod";
import { Types } from "mongoose";

export enum ReportReason {
  SPAM = 'Spam',
  INAPPROPRIATE = 'Inappropriate',
  HARASSMENT = 'Harassment',
  OTHER = 'Other'
}

export enum ContentType {
  USER = 'User',
  COMMENT = 'Comment',
  POST = 'Post'
}

export const reportSchema = z.object({
  reason: z.nativeEnum(ReportReason),
  description: z.string().optional(),
  date: z.date().default(() => new Date()),
  isResolved: z.boolean().default(false),
  reportedUser: z.string().transform(id => new Types.ObjectId(id)),
  sourceUser: z.string().transform(id => new Types.ObjectId(id)),
  reportedContent: z.string().transform(id => new Types.ObjectId(id)),
  contentType: z.nativeEnum(ContentType)
});

export const editReportSchema = reportSchema.partial();

export type Report = z.infer<typeof reportSchema>;
export type ReportInput = z.input<typeof reportSchema>;
