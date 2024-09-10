import { ContentType, ReportReason } from "@/utils/constants";
import { reportSchema } from "@/utils/types";
import mongoose, { Schema } from "mongoose";
import { z } from "zod";

export type Report = z.infer<typeof reportSchema>;

const ReportSchema = new Schema<Report>({
  reason: { type: String, enum: ReportReason, required: true },
  description: { type: String, required: false },
  date: { type: Date, required: true },
  isResolved: { type: Boolean, default: false },
  reportedUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sourceUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reportedContent: { type: Schema.Types.ObjectId, refPath: 'contentType', required: true },
  contentType: { type: String, enum: ContentType, required: true }
});

const ReportModel = mongoose.models?.Report ?? mongoose.model('Report', ReportSchema);

export default ReportModel;