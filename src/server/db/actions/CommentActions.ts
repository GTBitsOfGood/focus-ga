'use server'

import { commentSchema, commentLikeSchema, CommentInput, Comment, PopulatedComment } from "@/utils/types/comment";
import CommentModel from "../models/CommentModel";
import CommentLikeModel, { CommentLike } from "../models/CommentLikeModel";
import dbConnect from "../dbConnect";
import mongoose from "mongoose";
import PostModel from "../models/PostModel";
import UserModel from "../models/UserModel";

/**
 * Creates a new comment in the database.
 * @param comment - The comment input data.
 * @throws Will throw an error if the comment creation fails.
 * @returns The created comment object.
 */
export async function createComment(comment: CommentInput): Promise<Comment> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await dbConnect();
    const parsedData = commentSchema.parse(comment);
    const createdComment = await CommentModel.create([parsedData], { session });

    await PostModel.findByIdAndUpdate(
      parsedData.post,
      { $inc: { comments: 1 } },
      { session }
    );

    await session.commitTransaction();
    return createdComment[0].toObject();
  } catch (e) {
    console.log(e);
    await session.abortTransaction();
    throw new Error("Failed to create comment");
  } finally {
    session.endSession();
  }
}

/**
 * Deletes a comment from the database.
 * @param id - The ID of the comment to delete.
 * @throws Will throw an error if the comment doesn't exist or deletion fails.
 */
export async function deleteComment(id: string): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await dbConnect();
    const comment = await CommentModel.findByIdAndDelete(id, { session });
    if (!comment) {
      throw new Error("Comment does not exist");
    }

    await PostModel.findByIdAndUpdate(
      comment.post,
      { $inc: { comments: -1 } },
      { session }
    );

    await session.commitTransaction();
  } catch (e) {
    await session.abortTransaction();
    throw new Error("Failed to delete comment");
  } finally {
    session.endSession();
  }
}
/**
 * Edits an existing comment in the database.
 * @param id - The ID of the comment to edit.
 * @param comment - The partial comment input data for updating.
 * @throws Will throw an error if the comment update fails.
 * @returns The updated comment object.
 */
export async function editComment(id: string, comment: Partial<CommentInput>): Promise<Comment> {
  try {
    await dbConnect();
    const parsedData = commentSchema.partial().parse(comment);
    const updatedComment = await CommentModel.findByIdAndUpdate(id, parsedData, { new: true });
    if (!updatedComment) {
      throw new Error("Comment not found");
    }
    return updatedComment.toObject();
  } catch (e) {
    throw new Error("Failed to edit comment");
  }
}

/**
 * Creates a new like for a comment.
 * @param userId - The ID of the user liking the comment.
 * @param commentId - The ID of the comment being liked.
 * @throws Will throw an error if the like creation fails or if the user has already liked the comment.
 */
export async function createCommentLike(userId: string, commentId: string): Promise<CommentLike> {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(commentId)) {
      throw new Error("Invalid userId or commentId");
    }

    const doesLikeExist = await CommentLikeModel.findOne({ user: userId, comment: commentId });
    if (doesLikeExist) {
      throw new Error("User has already liked the comment");
    }

    const newCommentLike = { user: userId, comment: commentId };
    commentLikeSchema.parse(newCommentLike);

    const createdCommentLike = await CommentLikeModel.create([newCommentLike], { session });
    await CommentModel.findByIdAndUpdate(commentId, {$inc: {likes: 1}}, { session });
    
    await session.commitTransaction();
    return createdCommentLike[0].toObject();
  } catch (e) {
    console.log(e);
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
}

/**
 * Deletes a like from a comment.
 * @param userId - The ID of the user unliking the comment.
 * @param commentId - The ID of the comment being unliked.
 * @throws Will throw an error if the like deletion fails or if the user hasn't liked the comment.
 */
export async function deleteCommentLike(userId: string, commentId: string): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(commentId)) {
      throw new Error("Invalid userId or commentId");
    }

    const doesLikeExist = await CommentLikeModel.findOne({ user: userId, comment: commentId });
    if (!doesLikeExist) {
      throw new Error("User has not liked the comment");
    }

    await CommentLikeModel.deleteOne({ user: userId, comment: commentId}, { session });
    await CommentModel.findByIdAndUpdate(commentId, {$inc: {likes: -1}}, { session });
    
    await session.commitTransaction();
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
}

/**
 * Retrieves all comments under a post in descending order by date of creation, with authors populated, 
 * post and replyTo IDs converted to strings, and like status specified.
 * @param postId - The ID of the post whose comments are to be retrieved.
 * @param authUserId - The ID of the currently authenticated user, to determine whether they have liked each comment.
 * @throws Will throw an error if the post is not found.
 * @returns A promise that resolves to an array of partially populated comment objects.
 */
export async function getPostComments(postId: string, authUserId: string): Promise<PopulatedComment[]> {
  await dbConnect();

  const comments = await CommentModel
    .find({ post: postId })
    .sort({ date: 'desc' })
    .populate({ path: 'author', model: UserModel });
  const commentIds = comments.map(comment => comment._id);

  const likes = await CommentLikeModel.find({
    user: authUserId,
    comment: { $in: commentIds }
  });
  const likedIds = new Set(likes.map(like => like.comment.toString()));

  return comments.map(comment => {
    const res = comment.toObject();
    res.post = res.post.toString();
    res.replyTo = res.replyTo?.toString() || null;
    res.liked = likedIds.has(comment._id.toString());
    return res;
  });
}