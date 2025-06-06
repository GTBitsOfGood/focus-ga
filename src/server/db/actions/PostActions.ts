"use server";

import {
  postSchema,
  editPostSchema,
  Post,
  PostInput,
  PostSaveInput,
  PostLikeInput,
  PostLike,
  PopulatedPost,
} from "@/utils/types/post";
import PostModel from "../models/PostModel";
import PostSaveModel from "../models/PostSaveModel";
import PostLikeModel from "../models/PostLikeModel";
import CommentModel from "../models/CommentModel";
import { deleteComment, getPostComments } from "./CommentActions";
import { updateAllReportedContentResolved } from "./ReportActions";
import { getAllProfanities } from "./ProfanityActions";
import { postSaveSchema, postLikeSchema } from "@/utils/types/post";
import dbConnect from "../dbConnect";
import mongoose from "mongoose";
import UserModel from "../models/UserModel";
import { containsProfanity } from "@/utils/profanityChecker";
import DisabilityModel from "../models/DisabilityModel";
import { revalidatePath } from "next/cache";
import dayjs from "dayjs";
import { PostDeletionDurations } from "@/utils/consts";
import { AgeSelection } from "@/utils/types/common";
import { getAuthenticatedUser } from "./AuthActions";
import sanitizeHtml from "sanitize-html";
import { ReportReason, ContentType } from "@/utils/types/report";
import { createReport } from "./ReportActions";

// A MongoDB aggregation pipeline that efficiently populates a post
type PipelineArgs = {
  authUserId: string;
  isFlagged: boolean[];
  isAdmin?: boolean;
  visibility?: string;
  offset?: number;
  limit?: number;
  tags?: string[];
  locations?: string[];
  postId?: string;
  searchTerm?: string;
  age?: AgeSelection;
  excludeLanguageReports?: boolean;
};

type PostAggregationResult = {
  count: number;
  posts: PopulatedPost[];
};

function postPopulationPipeline({
  authUserId,
  isFlagged,
  isAdmin,
  visibility,
  offset,
  limit,
  tags,
  locations,
  postId,
  searchTerm,
  age,
  excludeLanguageReports,
}: PipelineArgs): mongoose.PipelineStage[] {
  if (age && age.maxAge && age.maxAge === 20) {
    age.maxAge = 100;
  }

  // Create base pipeline
  const pipeline: mongoose.PipelineStage[] = [];

  // Apply search or basic matching
  if (searchTerm) {
    pipeline.push({
      $search: {
        index: "focus-fuzzy-search-posts",
        text: {
          query: searchTerm,
          path: ["title", "content"],
          fuzzy: {},
        },
      },
    });
  } else if (postId) {
    pipeline.push({ $match: { _id: new mongoose.Types.ObjectId(postId) } });
  } else {
    pipeline.push({ $match: { isDeleted: false } });
    pipeline.push({ $sort: { date: -1 as const } });
  }

  // Filter by tags
  if (tags && tags.length) {
    pipeline.push({
      $match: {
        tags: { $in: tags.map((t) => new mongoose.Types.ObjectId(t)) },
      },
    });
  }

  // Filter out posts with language reports if needed
  if (excludeLanguageReports) {
    pipeline.push({
      $lookup: {
        from: "reports",
        let: { postId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$reportedContent", "$$postId"] },
                  { $eq: ["$reason", ReportReason.LANGUAGE] },
                  { $eq: ["$isResolved", false] },
                  { $eq: ["$contentType", ContentType.POST] }
                ]
              }
            }
          }
        ],
        as: "languageReports"
      }
    });

    pipeline.push({
      $match: {
        languageReports: { $size: 0 }
      }
    });
  }

  // Handle non-admin users - they can only see non-private posts or their own private posts
  if (!isAdmin) {
    pipeline.push({
      $match: {
        $or: [
          { isPrivate: false },
          {
            $and: [
              { isPrivate: true },
              { author: new mongoose.Types.ObjectId(authUserId) },
            ],
          },
        ],
      },
    });
  }

  // Visibility filter
  if (visibility === "Public") {
    pipeline.push({ $match: { isPrivate: false } });
  } else if (visibility === "Private") {
    pipeline.push({ $match: { isPrivate: true } });
  }

  // Filter by isFlagged
  if (isFlagged.length) {
    pipeline.push({ $match: { isFlagged: { $in: isFlagged } } });
  }

  // Add facet for pagination and additional lookups
  pipeline.push({
    $facet: {
      count: [{ $count: "count" }],
      posts: [
        ...(offset ? [{ $skip: offset }] : []),
        ...(limit ? [{ $limit: limit }] : []),

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

        { $match: { "author.isBanned": false } },

        // Age filter - lookup childBirthdates and filter by age
        ...(age && age.minAge !== undefined && age.maxAge !== undefined
          ? [
              // First, we need to get the childBirthdates which aren't included in the current author lookup
              {
                $lookup: {
                  from: UserModel.collection.name,
                  let: { authorId: "$author._id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ["$_id", { $toObjectId: "$$authorId" }],
                        },
                      },
                    },
                    { $project: { childBirthdates: 1, _id: 0 } },
                  ],
                  as: "ageData",
                },
              },
              {
                $unwind: {
                  path: "$ageData",
                  preserveNullAndEmptyArrays: true,
                },
              },

              // Now filter based on the age range
              {
                $match: {
                  $or: [
                    // No childBirthdates - include these posts
                    ...(age.maxAge === 100
                      ? [
                          { "ageData.childBirthdates": { $exists: false } },
                          { "ageData.childBirthdates": { $size: 0 } },
                        ]
                      : []),

                    // Has at least one child in the age range
                    {
                      "ageData.childBirthdates": {
                        $elemMatch: {
                          $lte: new Date(
                            new Date().getFullYear() - age.minAge,
                            new Date().getMonth(),
                            new Date().getDate(),
                          ),
                          $gte: new Date(
                            new Date().getFullYear() - age.maxAge - 1,
                            new Date().getMonth(),
                            new Date().getDate(),
                          ),
                        },
                      },
                    },
                  ],
                },
              },
            ]
          : []),

        // Filter by author location
        ...(locations && locations.length
          ? [{ $match: { "author.city": { $in: locations } } }]
          : []),

        // Populate tags
        {
          $lookup: {
            from: DisabilityModel.collection.name,
            localField: "tags",
            foreignField: "_id",
            pipeline: [{ $addFields: { _id: { $toString: "$_id" } } }],
            as: "tags",
          },
        },

        // Replace author and tags with default values if necessary
        {
          $addFields: {
            author: { $ifNull: ["$author", null] },
            tags: { $ifNull: ["$tags", []] },
          },
        },

        // Determine whether user has liked post
        {
          $lookup: {
            from: PostLikeModel.collection.name,
            let: { postId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$post", "$$postId"] },
                      {
                        $eq: [
                          "$user",
                          new mongoose.Types.ObjectId(authUserId),
                        ],
                      },
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

        // Determine whether user has saved post
        {
          $lookup: {
            from: PostSaveModel.collection.name,
            let: { postId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$post", "$$postId"] },
                      {
                        $eq: [
                          "$user",
                          new mongoose.Types.ObjectId(authUserId),
                        ],
                      },
                    ],
                  },
                },
              },
            ],
            as: "saved",
          },
        },
        {
          $addFields: {
            saved: { $gt: [{ $size: "$saved" }, 0] },
            _id: { $toString: "$_id" },
          },
        },

        {
          $lookup: {
            from: "comments",
            let: { postId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$post", { $toObjectId: "$$postId" }],
                      },
                      { $eq: ["$isFlagged", false] },
                      { $eq: ["$isDeleted", false] },
                    ],
                  },
                },
              },
              { $count: "count" },
            ],
            as: "unflaggedCommentCount",
          },
        },
        {
          $addFields: {
            comments: {
              $ifNull: [
                { $arrayElemAt: ["$unflaggedCommentCount.count", 0] },
                0,
              ],
            },
          },
        },
      ],
    },
  });

  // Remove the languageReports field from posts since it's only used for filtering
  if (excludeLanguageReports) {
    const postsStage = pipeline[pipeline.length - 1] as { $facet: { posts: any[] } };
    postsStage.$facet.posts.push({
      $project: { languageReports: 0 }
    });
  }

  return pipeline;
}

/**
 * Creates a new post in the database.
 * @param post - The post input data.
 * @throws Will throw an error if the post creation fails.
 * @returns The created post object.
 */
export async function createPost(post: PostInput): Promise<Post> {
  await dbConnect();

  const currentUser = await getAuthenticatedUser();
  if (!currentUser || currentUser.isBanned) {
    throw new Error("User does not have access");
  }

  const profanities = await getAllProfanities();
  const profanityWords = profanities.map((profanity) => profanity.name);

  const contentProfanities = containsProfanity(post.content, profanityWords);
  const titleProfanities = containsProfanity(post.title, profanityWords);
  const uniqueProfanities = Array.from(
    new Set([...contentProfanities, ...titleProfanities]),
  );

  const isFlagged = false;

  const author = await UserModel.findById(post.author);

  const validatedPost = postSchema.parse({
    ...post,
    title: sanitizeHtml(post.title),
    content: sanitizeHtml(post.content),
    expiresAt: dayjs(post.date)
      .add(
        PostDeletionDurations[
          author.postDeletionTimeline as keyof typeof PostDeletionDurations
        ],
        "ms",
      )
      .toDate(),
    isFlagged,
  });

  const createdPost = await PostModel.create(validatedPost);
  
  if (uniqueProfanities.length > 0) {
    await createReport({
      reason: ReportReason.LANGUAGE,
      description: `Profane language detected: ${uniqueProfanities.join(", ")}`,
      reportedUser: post.author,
      sourceUser: currentUser._id, // System is reporting this
      reportedContent: createdPost._id.toString(),
      contentType: ContentType.POST,
      isResolved: false,
    });
  }

  revalidatePath("/");
  return createdPost.toObject();
}

/**
 * Validates a post to determine if it will trigger a LANGUAGE report based on its content and title.
 * @param post - The post input data.
 * @returns An array of profane words found in the post content or title.
 */
export async function validatePost(post: PostInput): Promise<string[]> {
  await dbConnect();

  const profanities = await getAllProfanities();
  const profanityWords = profanities.map((profanity) => profanity.name);

  const contentProfanities = containsProfanity(post.content, profanityWords);
  const titleProfanities = containsProfanity(post.title, profanityWords);
  const uniqueProfanities = Array.from(
    new Set([...contentProfanities, ...titleProfanities]),
  );

  return uniqueProfanities;
}

/**
 * Pins a post in the database.
 * @param postId - The ID of the post to pin.
 * @throws Will throw an error if the post pinning fails or if the post is not found.
 */
export async function pinPost(
  authUserId: string,
  postId: string,
): Promise<{ success: boolean; error?: string }> {
  await dbConnect();
  const currentUser = await getAuthenticatedUser();
  if (!currentUser?.isAdmin) {
    throw new Error("Only admins can pin posts");
  }

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return { success: false, error: "Invalid post ID" };
  }

  const user = await UserModel.findById(authUserId);
  if (!user || !user.isAdmin) {
    return { success: false, error: "Only admins can pin posts" };
  }

  const existingPinnedPosts = await PostModel.countDocuments({
    isPinned: true,
  });
  if (existingPinnedPosts >= 5) {
    return { success: false, error: "Cannot pin more than 5 posts" };
  }

  const existingPin = await PostModel.findOne({ _id: postId, pinned: true });
  if (existingPin) {
    return { success: false, error: "Post is already pinned" };
  }

  const updatedPost = await PostModel.findByIdAndUpdate(
    postId,
    { isPinned: true },
    { new: true },
  );
  if (!updatedPost) {
    return { success: false, error: "Post not found" };
  }

  revalidatePath(`/posts/${postId}`);

  return { success: true };
}

/**
 * Unpins a post in the database.
 * @param authUserId - The ID of the user attempting to unpin the post.
 * @param postId - The ID of the post to unpin.
 * @returns A promise that resolves to an object indicating success or failure.
 */
export async function unpinPost(
  authUserId: string,
  postId: string,
): Promise<{ success: boolean; error?: string }> {
  await dbConnect();
  const currentUser = await getAuthenticatedUser();
  if (!currentUser?.isAdmin) {
    throw new Error("Only admins can unpin posts");
  }

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return { success: false, error: "Invalid post ID" };
  }

  const user = await UserModel.findById(authUserId);
  if (!user || !user.isAdmin) {
    return { success: false, error: "Only admins can unpin posts" };
  }

  const updatedPost = await PostModel.findByIdAndUpdate(
    postId,
    { isPinned: false },
    { new: true },
  );
  if (!updatedPost) {
    return { success: false, error: "Post not found" };
  }

  revalidatePath(`/posts/${postId}`);

  return { success: true };
}

/**
 * Retrieves all pinned posts from the database with their author and tags fields populated.
 * @param authUserId - The ID of the currently authenticated user to determine their like and save statuses.
 * @param options - Optional filters including excludeLanguageReports
 * @returns A promise that resolves to an object containing the count and an array of populated post objects.
 */
export async function getPopulatedPinnedPosts(
  authUserId: string,
  options?: { excludeLanguageReports?: boolean }
): Promise<PostAggregationResult> {
  await dbConnect();

  const currentUser = await getAuthenticatedUser();
  if (!currentUser) {
    throw new Error("User does not have access");
  }

  const pipeline = [
    { $match: { isPinned: true, isPrivate: false } },
    ...postPopulationPipeline({
      authUserId,
      isFlagged: [false],
      tags: [],
      locations: [],
      searchTerm: undefined,
      postId: undefined,
      excludeLanguageReports: options?.excludeLanguageReports
    }),
  ];

  const result = await PostModel.aggregate(pipeline);

  return {
    count: result[0]?.count?.[0]?.count || 0,
    posts: result[0]?.posts || [],
  };
}

/**
 * Retrieves all posts from the database with their author and disability fields populated and like status specified.
 * @param authUserId - The ID of the currently authenticated user, to determine whether they have liked each post.
 * @returns A promise that resolves to an array of populated post objects.
 */

type Filters = {
  tags?: string[];
  locations?: string[];
  searchTerm?: string;
  visibility?: string;
  isFlagged?: boolean[];
  age?: AgeSelection;
  excludeLanguageReports?: boolean;
};

export async function getPopulatedPosts(
  authUserId: string,
  isAdmin: boolean,
  offset: number,
  limit: number,
  { tags, locations, searchTerm, visibility, isFlagged, age, excludeLanguageReports }: Filters,
): Promise<PostAggregationResult> {
  await dbConnect();

  const currentUser = await getAuthenticatedUser();
  if (!currentUser) {
    throw new Error("User does not have access");
  }

  // Create the pipeline with the appropriate filters
  const pipeline = postPopulationPipeline({
    authUserId,
    isFlagged: isFlagged ?? [true, false],
    isAdmin,
    visibility,
    offset,
    limit,
    tags,
    locations,
    searchTerm,
    age,
    excludeLanguageReports
  });

  const postsInfo = await PostModel.aggregate(pipeline);

  return {
    count: postsInfo[0].count.length ? postsInfo[0].count[0].count : 0,
    posts: postsInfo[0].posts,
  };
}

/**
 *
 * @param userId
 * @returns
 */
export async function getPopulatedUserPosts(
  userId: string,
  currUserId?: string,
  isAdmin?: boolean,
): Promise<PopulatedPost[]> {
  await dbConnect();

  const currentUser = await getAuthenticatedUser();
  if (!currentUser) {
    throw new Error("User does not have access");
  }

  const postsShown =
    currUserId === userId || isAdmin
      ? { author: userId }
      : { author: userId, isPrivate: false };

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }
  const posts = await PostModel.find(postsShown)
    .populate({ path: "author", model: UserModel })
    .populate({ path: "tags", model: DisabilityModel });

  const plainPosts = posts ? posts.map((post) => post.toObject()) : [];

  return plainPosts;
}

/**
 * Retrieves a single post from the database by its ID with its author and disability fields populated.
 * @param id - The ID of the post to retrieve.
 * @param authUserId - The ID of the currently authenticated user, to determine whether they have liked and/or saved each post.
 * @param isAdmin - Whether the current user is an admin.
 * @param options - Optional parameters including excludeLanguageReports.
 * @returns A promise that resolves to a populated post object containing author and disability objects (or null if they are not found)
 * @throws Will throw an error if the post is not found or has language reports when excludeLanguageReports is true.
 */
export async function getPopulatedPost(
  id: string,
  authUserId: string,
  isAdmin: boolean,
  options?: { excludeLanguageReports?: boolean }
): Promise<PopulatedPost> {
  await dbConnect();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid post ID");
  }

  const currentUser = await getAuthenticatedUser();
  if (!currentUser) {
    throw new Error("User does not have access");
  }

  // For individual post lookup, we can still check for language reports in one query
  const aggregationResult = await PostModel.aggregate(
    postPopulationPipeline({
      authUserId,
      isAdmin,
      postId: id,
      isFlagged: [true, false],
      excludeLanguageReports: options?.excludeLanguageReports
    }),
  );
  
  const post = aggregationResult[0]?.posts[0];
  if (!post) {
    if (options?.excludeLanguageReports) {
      // Check if post exists but was filtered due to language reports
      const postExists = await PostModel.exists({ _id: new mongoose.Types.ObjectId(id) });
      if (postExists) {
        throw new Error("Post has language reports and was excluded from results");
      }
    }
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
export async function editPost(
  id: string,
  post: Partial<PostInput>,
): Promise<PostInput> {
  await dbConnect();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid post ID");
  }

  const currentUser = await getAuthenticatedUser();
  const postInfo = await PostModel.findById(id);
  if (
    !currentUser ||
    (!currentUser.isAdmin && currentUser._id !== postInfo.author?.toString()) ||
    currentUser.isBanned
  ) {
    throw new Error("User does not have access");
  }

  const validatedPost = editPostSchema.parse(post);
  if (post.editedByAdmin !== undefined) {
    validatedPost.editedByAdmin = post.editedByAdmin;
  }
  if (post.title) {
    validatedPost.title = sanitizeHtml(post.title);
  }
  if (post.content) {
    validatedPost.content = sanitizeHtml(post.content);
  }
  const updatedPost = await PostModel.findByIdAndUpdate(id, validatedPost, {
    new: true,
  });
  if (!updatedPost) {
    throw new Error("Post not found");
  }
  return {
    ...updatedPost.toObject(),
    author: updatedPost.author.toString(),
    editedByAdmin: updatedPost.editedByAdmin,
  };
}
/**
 * Marks a post as deleted in the database and deletes its associated likes, saves, and comments.
 * @param id - The ID of the post to delete.
 * @throws Will throw an error if the post deletion fails or if the post is not found.
 */

export async function deletePost(
  id: string,
  authUserId: string,
): Promise<void> {
  await dbConnect();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid post ID");
  }

  const currentUser = await getAuthenticatedUser();
  if (
    !currentUser ||
    (!currentUser.isAdmin && currentUser._id !== authUserId)
  ) {
    throw new Error("User does not have access");
  }

  const updatedPost = await PostModel.findByIdAndUpdate(id, {
    title: "[deleted]",
    content: "[deleted]",
    author: new mongoose.Types.ObjectId("000000000000000000000000"),
    tags: [],
    isDeleted: true,
  });

  //resolves all reports for a post
  await updateAllReportedContentResolved(id);

  // deletes all comments under a deleted post and resolves any reports they might have
  const commentsForCurrPost = await getPostComments(id, authUserId);
  if (commentsForCurrPost.length > 0) {
    commentsForCurrPost.map(async (comment) => {
      await deleteComment(comment._id);
    });
  }

  if (!updatedPost) {
    throw new Error("Post not found");
  }

  await PostLikeModel.deleteMany({ post: id });
  await PostSaveModel.deleteMany({ post: id });
}

/**
 * Creates a new post save record in the database.
 * @param userId - The ID of the user saving the post.
 * @param postId - The ID of the post being saved.
 * @throws Will throw an error if the post save creation fails or if the post is already saved.
 * @returns The created post save object.
 */
export async function createPostSave(
  userId: string,
  postId: string,
): Promise<PostSaveInput> {
  await dbConnect();

  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(postId)
  ) {
    throw new Error("Invalid user ID or post ID");
  }

  const currentUser = await getAuthenticatedUser();
  if (!currentUser || (!currentUser.isAdmin && currentUser._id !== userId)) {
    throw new Error("User does not have access");
  }

  const existingSave = await PostSaveModel.findOne({
    user: userId,
    post: postId,
  });
  if (existingSave) {
    throw new Error("Post already saved by this user");
  }

  const postSaveInput: PostSaveInput = { user: userId, post: postId };
  const validatedPostSave = postSaveSchema.parse(postSaveInput);
  const createdPostSave = await PostSaveModel.create(validatedPostSave);

  revalidatePath(`/posts/${postId}`);
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

  const currentUser = await getAuthenticatedUser();
  if (!currentUser) {
    throw new Error("User does not have access");
  }

  const savedPosts = await PostSaveModel.find({ user: userId })
    .sort({ date: -1 })
    .populate("post")
    .exec();
  return savedPosts.map((save) => save.post.toObject());
}

/**
 * Retrieves all saved posts for a specific user in populated form.
 * @param userId - The ID of the user whose saved posts are being retrieved.
 * @returns A promise that resolves to an array of populated post objects.
 * @throws Will throw an error if the user ID is invalid.
 */
export async function getPopulatedSavedPosts(
  userId: string,
  isAdmin: boolean,
): Promise<PopulatedPost[]> {
  await dbConnect();

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const currentUser = await getAuthenticatedUser();
  if (!currentUser) {
    throw new Error("User does not have access");
  }

  const pipeline: mongoose.PipelineStage[] = [
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $sort: { date: -1 as const } },
    {
      $lookup: {
        from: PostModel.collection.name,
        localField: "post",
        foreignField: "_id",
        as: "post",
      },
    },
    { $unwind: { path: "$post" } },
    { $replaceRoot: { newRoot: "$post" } },
  ].concat(
    postPopulationPipeline({
      authUserId: userId,
      isAdmin: isAdmin,
      isFlagged: [true, false],
    }).slice(2) satisfies mongoose.PipelineStage[] as any,
  );

  const pipelineResult = await PostSaveModel.aggregate(pipeline);
  const savedPosts = pipelineResult[0].posts;
  return savedPosts;
}

/**
 * Deletes a post save record from the database.
 * @param userId - The ID of the user unsaving the post.
 * @param postId - The ID of the post being unsaved.
 * @throws Will throw an error if the post save deletion fails or if the save is not found.
 */
export async function deletePostSave(
  userId: string,
  postId: string,
): Promise<void> {
  await dbConnect();

  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(postId)
  ) {
    throw new Error("Invalid user ID or post ID");
  }

  const currentUser = await getAuthenticatedUser();
  if (!currentUser || (!currentUser.isAdmin && currentUser._id !== userId)) {
    throw new Error("User does not have access");
  }

  const deletedSave = await PostSaveModel.findOneAndDelete({
    user: userId,
    post: postId,
  });
  if (!deletedSave) {
    throw new Error("Post save not found");
  }
  revalidatePath(`/posts/${postId}`);
}

/**
 * Creates a new post like record in the database.
 * @param userId - The ID of the user liking the post.
 * @param postId - The ID of the post being liked.
 * @throws Will throw an error if the post like creation fails or if the post is already liked.
 * @returns The created post like object and the updated post.
 */
export async function createPostLike(
  userId: string,
  postId: string,
): Promise<PostLike> {
  await dbConnect();

  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(postId)
  ) {
    throw new Error("Invalid user ID or post ID");
  }

  const currentUser = await getAuthenticatedUser();
  if (!currentUser || (!currentUser.isAdmin && currentUser._id !== userId)) {
    throw new Error("User does not have access");
  }

  const session = await PostModel.startSession();
  session.startTransaction();

  try {
    const existingLike = await PostLikeModel.findOne({
      user: userId,
      post: postId,
    });
    if (existingLike) {
      await session.abortTransaction();
      throw new Error("Post already liked by this user");
    }

    const postLikeInput: PostLikeInput = { user: userId, post: postId };
    const validatedPostLike = postLikeSchema.parse(postLikeInput);
    const createdPostLike = await PostLikeModel.create([validatedPostLike], {
      session,
    });

    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      { $inc: { likes: 1 } },
      { session, new: true },
    );
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
    revalidatePath(`/posts/${postId}`);
  }
}

/**
 * Deletes a post like record from the database.
 * @param userId - The ID of the user unliking the post.
 * @param postId - The ID of the post being unliked.
 * @throws Will throw an error if the post like deletion fails or if the like is not found.
 */
export async function deletePostLike(
  userId: string,
  postId: string,
): Promise<void> {
  await dbConnect();

  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(postId)
  ) {
    throw new Error("Invalid user ID or post ID");
  }

  const currentUser = await getAuthenticatedUser();
  if (!currentUser || (!currentUser.isAdmin && currentUser._id !== userId)) {
    throw new Error("User does not have access");
  }

  const session = await PostModel.startSession();
  session.startTransaction();

  try {
    const deletedLike = await PostLikeModel.findOneAndDelete(
      { user: userId, post: postId },
      { session },
    );
    if (!deletedLike) {
      await session.abortTransaction();
      throw new Error("Post like not found");
    }

    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      { $inc: { likes: -1 } },
      { session, new: true },
    );
    if (!updatedPost) {
      throw new Error("Post not found");
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
    revalidatePath(`/posts/${postId}`);
  }
}

/**
 * Checks if there are any posts that need moderation due to language issues.
 * This is useful for administrators to know if there's any content that needs moderation.
 * @returns A promise that resolves to a boolean indicating whether there are any unresolved LANGUAGE reports.
 */
export async function hasFlaggedPosts(): Promise<boolean> {
  await dbConnect();
  const currentUser = await getAuthenticatedUser();
  if (!currentUser || !currentUser.isAdmin) {
    throw new Error("User does not have access");
  }

  const ReportModel = mongoose.models.Report || mongoose.model('Report', require('../models/ReportModel').default.schema);

  const unresolvedLanguageReportsCount = await ReportModel.countDocuments({
    reason: ReportReason.LANGUAGE,
    isResolved: false,
    contentType: ContentType.POST
  });
  
  return unresolvedLanguageReportsCount > 0;
}
