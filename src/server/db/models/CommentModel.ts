import mongoose, { Schema } from "mongoose";
import { Comment } from "@/utils/types/comment";
import PostModel from "./PostModel";
import { createNotification } from "../actions/NotificationActions";

const CommentSchema = new Schema<Comment>({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  date: { type: Date, default: Date.now() },
  content: { type: String, required: true },
  likes: { type: Number, default: 0 },
  replyTo: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
  isDeleted: { type: Boolean, default: false }
});

CommentSchema.post("save", async function (comment) {
  try {
    const post = await PostModel.findById(comment.post).populate("author");
    if (post?.author && post.author.notificationPreference && post.author._id.toString() != comment.author.toString()) {
      // Create a notification
      await createNotification({
        author: post.author._id.toString(),
        post: post._id.toString(),
        comment: comment._id.toString(),
        commenter: comment.author.toString(),
        createdAt: comment.date,
      });
    }

  } catch (error) {
    console.error("Error in post save hook:", error);
  }
});

const CommentModel = mongoose.models.Comment || mongoose.model("Comment", CommentSchema);

export default CommentModel;
