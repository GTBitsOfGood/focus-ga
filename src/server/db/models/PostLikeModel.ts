import { PostLike } from "@/utils/types";
import mongoose from "mongoose";
import { Schema } from "mongoose";
import { z } from "zod";

const PostLikeSchema = new Schema<PostLike>({
  post: { type: Schema.Types.ObjectId, required: true, ref: 'Post' },
  user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  date: { type: Date, default: Date.now() },
});

const PostLikeModel = mongoose.models?.PostLike ?? mongoose.model("PostLike", PostLikeSchema);

export default PostLikeModel;