import { z } from "zod";
import { Types } from "mongoose";
import { ExtendId } from "./common";
import { User } from "./user";

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

export type Report = ExtendId<z.infer<typeof reportSchema>>;
export type ReportInput = z.input<typeof reportSchema>;

export type PopulatedReport = Omit<Report, 'sourceUser'> & {
  sourceUser: User
};
