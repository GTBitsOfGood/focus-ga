import { PostSave } from "@/utils/types/post";
import mongoose from "mongoose";
import { Schema } from "mongoose";

const PostSaveSchema = new Schema<PostSave>({
  post: { type: Schema.Types.ObjectId, required: true, ref: 'Post' },
  user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  date: { type: Date, default: Date.now() },
});

const PostSaveModel = mongoose.models?.PostSave ?? mongoose.model("PostSave", PostSaveSchema);

export default PostSaveModel;
