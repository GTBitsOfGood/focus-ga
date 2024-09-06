'use server'

import { commentSchema, commentLikeSchema, ExtendId } from "@/utils/types";
import CommentModel, { Comment } from "../models/CommentModel";
import CommentLikeModel from "../models/CommentLikeModel";
import dbConnect from "../dbConnect";
import mongoose from "mongoose";

export async function createComment(comment: Comment) {
    try {
        await dbConnect();
        const parsedData = commentSchema.parse(comment);
        await CommentModel.create(parsedData);
    } catch (e) {
        throw e;
    }
}

export async function deleteComment(id: string) {
    try {
        await dbConnect();
        const comment = await CommentModel.findByIdAndDelete(id);
        if (!comment) {
            throw new Error("Comment does not exist");
        }
        return comment;
    } catch (e) {
        throw e;
    }
}

export async function editComment(id: string, comment: Partial<Comment>) {
    try {
        await dbConnect();
        const parsedData = commentSchema.partial().parse(comment);
    } catch (e) {
        throw e;
    }
}

export async function createCommentLike(userId: string, commentId: string) {
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

        await CommentLikeModel.create([newCommentLike], { session });
        await CommentModel.findByIdAndUpdate(commentId, {$inc: {likes: 1}}, { session });

        await session.commitTransaction();
    } catch (e) {
        await session.abortTransaction();
        throw e;
    } finally {
        session.endSession();
    }
}

export async function deleteCommentLike(userId: string, commentId: string) {
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