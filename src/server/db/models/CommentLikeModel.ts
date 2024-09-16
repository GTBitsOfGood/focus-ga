import { commentLikeSchema } from "@/utils/types/comment";
import mongoose from "mongoose";
import { Schema } from "mongoose";
import { z } from "zod";

export type CommentLike = z.infer<typeof commentLikeSchema>;

const CommentLikeSchema = new Schema<CommentLike>({
    comment: { type: Schema.Types.ObjectId, ref: 'Comment', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now() },
});

const CommentLikeModel = mongoose.models?.CommentLike ?? mongoose.model("CommentLike", CommentLikeSchema);

export default CommentLikeModel;
