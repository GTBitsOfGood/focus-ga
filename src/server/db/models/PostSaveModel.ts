import { PostSave } from "@/utils/types";
import mongoose from "mongoose";
import { Schema } from "mongoose";
import { z } from "zod";

const PostSaveSchema = new Schema<PostSave>({
  post: { type: Schema.Types.ObjectId, required: true, ref: 'Post' },
  user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  date: { type: Date, default: Date.now() },
});

const PostSaveModel = mongoose.models?.PostSave ?? mongoose.model("PostSave", PostSaveSchema);

export default PostSaveModel;