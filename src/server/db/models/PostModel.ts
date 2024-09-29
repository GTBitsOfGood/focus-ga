import { Post } from "@/utils/types/post";
import mongoose from "mongoose";
import { Schema } from "mongoose";

const PostSchema = new Schema<Post>({
  author: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  date: { type: Date, default: Date.now() },
  title: { type: String, required: true, maxLength: 100 },
  content: { type: String, required: true },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  tags: [{ type: Schema.Types.ObjectId, required: true, ref: 'Disability' }],
  isPinned: { type: Boolean, default: false },
  isPrivate: { type: Boolean, default: false },
  isFlagged: { type: Boolean, default: false },
});

const PostModel = mongoose.models?.Post ?? mongoose.model("Post", PostSchema);

export default PostModel;
