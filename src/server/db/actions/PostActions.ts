'use server'

import { postSchema, editPostSchema, ExtendId, Post, PostInput, PostSave, PostSaveInput, PostLike, PostLikeInput } from "@/utils/types";
import PostModel from "../models/PostModel";
import PostSaveModel from "../models/PostSaveModel";
import PostLikeModel from "../models/PostLikeModel";
import { postSaveSchema, postLikeSchema } from "@/utils/types";
import dbConnect from "../dbConnect";

export async function createPost(post: PostInput): Promise<Post> {
  await dbConnect();

  const validatedPost = postSchema.parse(post);
  const newPost = await PostModel.create(validatedPost);
  return newPost.toObject();
}

export async function getPosts(): Promise<ExtendId<Post>[]> {
  await dbConnect();

  const posts = await PostModel.find();
  return posts;
}

export async function editPost(id: string, post: Partial<PostInput>): Promise<Post | null> {
  await dbConnect();

  const validatedPost = editPostSchema.parse(post);
  const updatedPost = await PostModel.findByIdAndUpdate(id, validatedPost, { new: true });
  return updatedPost ? updatedPost.toObject() : null;
}

export async function deletePost(id: string): Promise<void> {
  await dbConnect();

  await PostModel.findByIdAndDelete(id);
}

export async function createPostSave(userId: string, postId: string): Promise<PostSave> {
  await dbConnect();

  const postSaveInput: PostSaveInput = { user: userId, post: postId };
  const validatedPostSave = postSaveSchema.parse(postSaveInput);
  const newPostSave = await PostSaveModel.create(validatedPostSave);
  return newPostSave.toObject();
}

export async function getSavedPosts(userId: string): Promise<Post[]> {
  await dbConnect();

  const savedPosts = await PostSaveModel.find({ user: userId })
    .sort({ date: -1 })
    .populate('post')
    .exec();
  return savedPosts.map(save => save.post.toObject());
}

export async function deletePostSave(userId: string, postId: string): Promise<void> {
  await dbConnect();

  await PostSaveModel.findOneAndDelete({ user: userId, post: postId });
}

export async function createPostLike(userId: string, postId: string): Promise<PostLike | null> {
  await dbConnect();

  const session = await PostModel.startSession();
  session.startTransaction();

  try {
    const existingLike = await PostLikeModel.findOne({ user: userId, post: postId });
    if (existingLike) {
      await session.abortTransaction();
      return null;
    }

    const postLikeInput: PostLikeInput = { user: userId, post: postId };
    const validatedPostLike = postLikeSchema.parse(postLikeInput);
    const newPostLike = await PostLikeModel.create([validatedPostLike], { session });

    await PostModel.findByIdAndUpdate(postId, { $inc: { likes: 1 } }, { session });

    await session.commitTransaction();
    return newPostLike[0].toObject();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function deletePostLike(userId: string, postId: string): Promise<void> {
  await dbConnect();

  const session = await PostModel.startSession();
  session.startTransaction();

  try {
    const deletedLike = await PostLikeModel.findOneAndDelete({ user: userId, post: postId }, { session });
    if (!deletedLike) {
      await session.abortTransaction();
      return;
    }

    await PostModel.findByIdAndUpdate(postId, { $inc: { likes: -1 } }, { session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
