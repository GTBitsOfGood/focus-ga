import { commentSchema } from "@/utils/types";
import mongoose, { Schema } from "mongoose";
import { z } from "zod";

export type Comment = z.infer<typeof commentSchema>;
export type CommentInput = z.input<typeof commentSchema>;

const CommentSchema = new Schema<Comment>({
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    date: { type: Date, default: Date.now() },
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    replyTo: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
});

const CommentModel = mongoose.models?.Comment ?? mongoose.model("Comment", CommentSchema);

export default CommentModel;