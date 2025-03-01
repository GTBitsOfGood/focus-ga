"use server";

import {
  commentSchema,
  commentLikeSchema,
  CommentInput,
  Comment,
  PopulatedComment,
} from "@/utils/types/comment";
import CommentModel from "../models/CommentModel";
import CommentLikeModel, { CommentLike } from "../models/CommentLikeModel";
import dbConnect from "../dbConnect";
import mongoose from "mongoose";
import PostModel from "../models/PostModel";
import UserModel from "../models/UserModel";
import { getAllProfanities } from "./ProfanityActions";
import { containsProfanity } from "@/utils/profanityChecker";
import { revalidatePath } from "next/cache";

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
    const profanities = await getAllProfanities();
    const profanityWords = profanities.map((profanity) => profanity.name);

    const isFlagged = containsProfanity(comment.content, profanityWords);
    const parsedData = commentSchema.parse({
      ...comment,
      isFlagged,
    });
    const createdComment = await CommentModel.create([parsedData], { session });

    await PostModel.findByIdAndUpdate(
      parsedData.post,
      { $inc: { comments: 1 } },
      { session },
    );

    await session.commitTransaction();
    return createdComment[0].toObject();
  } catch (e) {
    console.log(e);
    await session.abortTransaction();
    throw new Error("Failed to create comment");
  } finally {
    session.endSession();
    revalidatePath(`/posts/${comment.post}`);
  }
}

/**
 * Marks a comment as deleted in the database, deletes its associated likes, and updates its parent post's comment count.
 * @param id - The ID of the comment to delete.
 * @throws Will throw an error if the comment doesn't exist or deletion fails.
 */
export async function deleteComment(id: string): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await dbConnect();
    const comment = await CommentModel.findByIdAndUpdate(id, {
      content: "[deleted]",
      author: new mongoose.Types.ObjectId("000000000000000000000000"),
      isDeleted: true,
    });
    if (!comment) {
      throw new Error("Comment does not exist");
    }

    await PostModel.findByIdAndUpdate(
      comment.post,
      { $inc: { comments: -1 } },
      { session },
    );
    await CommentLikeModel.deleteMany({ comment: id });

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
export async function editComment(
  id: string,
  comment: Partial<CommentInput>,
): Promise<Comment> {
  try {
    await dbConnect();
    const parsedData = commentSchema.partial().parse(comment);
    const updatedComment = await CommentModel.findByIdAndUpdate(
      id,
      parsedData,
      { new: true },
    );
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
export async function createCommentLike(
  userId: string,
  commentId: string,
): Promise<CommentLike> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(commentId)
    ) {
      throw new Error("Invalid userId or commentId");
    }

    const doesLikeExist = await CommentLikeModel.findOne({
      user: userId,
      comment: commentId,
    });
    if (doesLikeExist) {
      throw new Error("User has already liked the comment");
    }

    const newCommentLike = { user: userId, comment: commentId };
    commentLikeSchema.parse(newCommentLike);

    const createdCommentLike = await CommentLikeModel.create([newCommentLike], {
      session,
    });
    await CommentModel.findByIdAndUpdate(
      commentId,
      { $inc: { likes: 1 } },
      { session },
    );

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
export async function deleteCommentLike(
  userId: string,
  commentId: string,
): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(commentId)
    ) {
      throw new Error("Invalid userId or commentId");
    }

    const doesLikeExist = await CommentLikeModel.findOne({
      user: userId,
      comment: commentId,
    });
    if (!doesLikeExist) {
      throw new Error("User has not liked the comment");
    }

    await CommentLikeModel.deleteOne(
      { user: userId, comment: commentId },
      { session },
    );
    await CommentModel.findByIdAndUpdate(
      commentId,
      { $inc: { likes: -1 } },
      { session },
    );

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
export async function getPostComments(
  postId: string,
  authUserId: string,
): Promise<PopulatedComment[]> {
  await dbConnect();

  const comments = await CommentModel.aggregate([
    // Match post ID and filter out deleted child comments (but not deleted parent comments)
    {
      $match: {
        post: new mongoose.Types.ObjectId(postId),
        $or: [{ replyTo: null }, { isDeleted: false }],
      },
    },

    // Sort by date in descending order
    { $sort: { date: -1 } },

    // Populate author field
    {
      $lookup: {
        from: UserModel.collection.name,
        localField: "author",
        foreignField: "_id",
        pipeline: [{ $addFields: { _id: { $toString: "$_id" } } }],
        as: "author",
      },
    },
    { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },

    // Determine whether user has liked comment
    {
      $lookup: {
        from: CommentLikeModel.collection.name,
        let: { commentId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$comment", "$$commentId"] },
                  { $eq: ["$user", new mongoose.Types.ObjectId(authUserId)] },
                ],
              },
            },
          },
        ],
        as: "liked",
      },
    },
    {
      $addFields: {
        liked: { $gt: [{ $size: "$liked" }, 0] },
      },
    },

    // Convert ObjectIds to strings and insert default author value if necessary
    {
      $addFields: {
        _id: { $toString: "$_id" },
        post: { $toString: "$post" },
        replyTo: { $toString: "$replyTo" },
        author: { $ifNull: ["$author", null] },
      },
    },
  ]);

  return comments;
}

/**
 * Retrieves a single post from the database by its ID with its author and disability fields populated.
 * @param id - The ID of the post to retrieve.
 * @param authUserId - The ID of the currently authenticated user, to determine whether they have liked and/or saved each post.
 * @returns A promise that resolves to a populated post object containing author and disability objects (or null if they are not found)
 * @throws Will throw an error if the post is not found.
 */
export async function getPopulatedComment(
  id: string,
  authUserId: string,
): Promise<PopulatedComment> {
  await dbConnect();

  const comment = await CommentModel.findOne({ _id: id, isDeleted: false })
    .populate("author")
    .exec();

  if (!comment) {
    throw new Error("Comment not found");
  }

  const liked = await CommentLikeModel.exists({
    comment: id,
    user: authUserId,
  });

  const plainComment = comment.toObject();
  return {
    ...plainComment,
    post: comment.post.toString(),
    replyTo: comment.replyTo ? comment.replyTo.toString() : null,
    liked: !!liked,
  };
}
