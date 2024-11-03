import mongoose, { Schema } from "mongoose";
import { Comment } from "@/utils/types/comment";

const CommentSchema = new Schema<Comment>({
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    date: { type: Date, default: Date.now() },
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    replyTo: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
    isDeleted: { type: Boolean, default: false }
});

const CommentModel = mongoose.models?.Comment ?? mongoose.model("Comment", CommentSchema);

export default CommentModel;
