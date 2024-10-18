'use server'

import { postSchema, editPostSchema, Post, PostInput, PostSaveInput, PostLikeInput, PostLike, PopulatedPost } from "@/utils/types/post";
import PostModel from "../models/PostModel";
import PostSaveModel from "../models/PostSaveModel";
import PostLikeModel from "../models/PostLikeModel";
import { postSaveSchema, postLikeSchema } from "@/utils/types/post";
import dbConnect from "../dbConnect";
import mongoose from "mongoose";
import UserModel from "../models/UserModel";
import DisabilityModel from "../models/DisabilityModel";
import { revalidatePath } from "next/cache";

// A MongoDB aggregation pipeline that efficiently populates a post
const postPopulationPipeline = (authUserId: string, postId?: string) => [
  // Match specific post ID if given
  ... postId ? [{ $match: { _id: new mongoose.Types.ObjectId(postId) } }] : [],

  // Populate author field
  { $lookup: {
    from: UserModel.collection.name,
    localField: 'author',
    foreignField: '_id',
    pipeline: [{ $addFields: { _id: { $toString: '$_id' } } }],
    as: 'author'
  } },
  { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },

  // Populate tags
  { $lookup: {
    from: DisabilityModel.collection.name,
    localField: 'tags',
    foreignField: '_id',
    pipeline: [{ $addFields: { _id: { $toString: '$_id' } } }],
    as: 'tags'
  } },

  // Replace author and tags with default values if necessary
  { $addFields: {
    author: { $ifNull: ['$author', null] },
    tags: { $ifNull: ['$tags', []] }
  } },

  // Determine whether user has liked post
  { $lookup: {
    from: PostLikeModel.collection.name,
    let: { postId: '$_id'  },
    pipeline: [
      { $match: {
        $expr: {
          $and: [
            { $eq: ['$post', '$$postId'] },
            { $eq: ['$user', new mongoose.Types.ObjectId(authUserId)] }
          ]
        }
      } }
    ],
    as: 'liked'
  } },
  { $addFields: {
    liked: { $gt: [{ $size: '$liked' }, 0] }
  } },

  // Determine whether user has saved post
  { $lookup: {
    from: PostSaveModel.collection.name,
    let: { postId: '$_id'  },
    pipeline: [
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ['$post', '$$postId'] },
              { $eq: ['$user', new mongoose.Types.ObjectId(authUserId)] }
            ]
          }
        }
      }
    ],
    as: 'saved'
  } },
  { $addFields: {
    saved: { $gt: [{ $size: '$saved' }, 0] },
    _id: { $toString: '$_id' }
  } }
];

/**
 * Creates a new post in the database.
 * @param post - The post input data.
 * @throws Will throw an error if the post creation fails.
 * @returns The created post object.
 */
export async function createPost(post: PostInput): Promise<Post> {
  await dbConnect();

  const validatedPost = postSchema.parse(post);
  const createdPost = await PostModel.create(validatedPost);

  revalidatePath("/");
  return createdPost.toObject();
}

/**
 * Retrieves all posts from the database.
 * @returns A promise that resolves to an array of post objects.
 */
export async function getPosts(): Promise<Post[]> {
  await dbConnect();

  const posts = await PostModel.find();
  return posts.map(post => post.toObject());
}

/**
 * Retrieves all posts from the database with their author and disability fields populated and like status specified.
 * @param authUserId - The ID of the currently authenticated user, to determine whether they have liked each post.
 * @returns A promise that resolves to an array of populated post objects.
 */
export async function getPopulatedPosts(authUserId: string): Promise<PopulatedPost[]> {
  await dbConnect();

  const posts = await PostModel.aggregate(postPopulationPipeline(authUserId));
  return posts;
}

/**
 * Retrieves a single post from the database by its ID.
 * @param id - The ID of the post to retrieve.
 * @returns A promise that resolves to a post object.
 * @throws Will throw an error if the post is not found.
 */
export async function getPost(id: string): Promise<Post> {
  await dbConnect();

  const post = await PostModel.findById(id);
  if (!post) {
    throw new Error("Post not found");
  }
  return post.toObject();
}

/**
 * Retrieves a single post from the database by its ID with its author and disability fields populated and like and save statuses specified.
 * @param id - The ID of the post to retrieve.
 * @param authUserId - The ID of the currently authenticated user, to determine whether they have liked and/or saved each post.
 * @returns A promise that resolves to a populated post object containing author and disability objects (or null if they are not found)
 * @throws Will throw an error if the post is not found.
 */
export async function getPopulatedPost(id: string, authUserId: string): Promise<PopulatedPost> {
  await dbConnect();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid post ID");
  }

  const [post] = await PostModel.aggregate(postPopulationPipeline(authUserId, id));
  if (!post) {
    throw new Error("Post not found");
  }
  return post;
}

/**
 * Updates an existing post in the database.
 * @param id - The ID of the post to update.
 * @param post - The partial post input data for updating.
 * @throws Will throw an error if the post update fails or if the post is not found.
 * @returns The updated post object.
 */
export async function editPost(id: string, post: Partial<PostInput>): Promise<Post> {
  await dbConnect();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid post ID");
  }

  const validatedPost = editPostSchema.parse(post);
  const updatedPost = await PostModel.findByIdAndUpdate(id, validatedPost, { new: true });
  if (!updatedPost) {
    throw new Error("Post not found");
  }
  return updatedPost;
}

/**
 * Deletes a post from the database.
 * @param id - The ID of the post to delete.
 * @throws Will throw an error if the post deletion fails or if the post is not found.
 */
export async function deletePost(id: string): Promise<void> {
  await dbConnect();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid post ID");
  }

  const deletedPost = await PostModel.findByIdAndDelete(id);
  if (!deletedPost) {
    throw new Error("Post not found");
  }
}

/**
 * Creates a new post save record in the database.
 * @param userId - The ID of the user saving the post.
 * @param postId - The ID of the post being saved.
 * @throws Will throw an error if the post save creation fails or if the post is already saved.
 * @returns The created post save object.
 */
export async function createPostSave(userId: string, postId: string): Promise<PostSaveInput> {
  await dbConnect();

  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(postId)) {
    throw new Error("Invalid user ID or post ID");
  }

  const existingSave = await PostSaveModel.findOne({ user: userId, post: postId });
  if (existingSave) {
    throw new Error("Post already saved by this user");
  }

  const postSaveInput: PostSaveInput = { user: userId, post: postId };
  const validatedPostSave = postSaveSchema.parse(postSaveInput);
  const createdPostSave = await PostSaveModel.create(validatedPostSave);
  return createdPostSave.toObject();
}

/**
 * Retrieves all saved posts for a specific user.
 * @param userId - The ID of the user whose saved posts are being retrieved.
 * @returns A promise that resolves to an array of saved post objects.
 * @throws Will throw an error if the user ID is invalid.
 */
export async function getSavedPosts(userId: string): Promise<Post[]> {
  await dbConnect();

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const savedPosts = await PostSaveModel.find({ user: userId })
    .sort({ date: -1 })
    .populate('post')
    .exec();
  return savedPosts.map(save => save.post.toObject());
}

/**
 * Deletes a post save record from the database.
 * @param userId - The ID of the user unsaving the post.
 * @param postId - The ID of the post being unsaved.
 * @throws Will throw an error if the post save deletion fails or if the save is not found.
 */
export async function deletePostSave(userId: string, postId: string): Promise<void> {
  await dbConnect();

  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(postId)) {
    throw new Error("Invalid user ID or post ID");
  }

  const deletedSave = await PostSaveModel.findOneAndDelete({ user: userId, post: postId });
  if (!deletedSave) {
    throw new Error("Post save not found");
  }
}

/**
 * Creates a new post like record in the database.
 * @param userId - The ID of the user liking the post.
 * @param postId - The ID of the post being liked.
 * @throws Will throw an error if the post like creation fails or if the post is already liked.
 * @returns The created post like object and the updated post.
 */
export async function createPostLike(userId: string, postId: string): Promise<PostLike> {
  await dbConnect();

  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(postId)) {
    throw new Error("Invalid user ID or post ID");
  }

  const session = await PostModel.startSession();
  session.startTransaction();

  try {
    const existingLike = await PostLikeModel.findOne({ user: userId, post: postId });
    if (existingLike) {
      await session.abortTransaction();
      throw new Error("Post already liked by this user");
    }

    const postLikeInput: PostLikeInput = { user: userId, post: postId };
    const validatedPostLike = postLikeSchema.parse(postLikeInput);
    const createdPostLike = await PostLikeModel.create([validatedPostLike], { session });

    const updatedPost = await PostModel.findByIdAndUpdate(postId, { $inc: { likes: 1 } }, { session, new: true });
    if (!updatedPost) {
      throw new Error("Post not found");
    }

    await session.commitTransaction();
    return createdPostLike[0].toObject();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Deletes a post like record from the database.
 * @param userId - The ID of the user unliking the post.
 * @param postId - The ID of the post being unliked.
 * @throws Will throw an error if the post like deletion fails or if the like is not found.
 */
export async function deletePostLike(userId: string, postId: string): Promise<void> {
  await dbConnect();

  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(postId)) {
    throw new Error("Invalid user ID or post ID");
  }

  const session = await PostModel.startSession();
  session.startTransaction();

  try {
    const deletedLike = await PostLikeModel.findOneAndDelete({ user: userId, post: postId }, { session });
    if (!deletedLike) {
      await session.abortTransaction();
      throw new Error("Post like not found");
    }

    const updatedPost = await PostModel.findByIdAndUpdate(postId, { $inc: { likes: -1 } }, { session, new: true });
    if (!updatedPost) {
      throw new Error("Post not found");
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
