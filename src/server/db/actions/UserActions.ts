"use server";

import {
  editUserSchema,
  PopulatedUser,
  User,
  UserInput,
  userSchema,
} from "@/utils/types/user";
import UserModel from "../models/UserModel";
import dbConnect from "../dbConnect";
import { revalidatePath } from "next/cache";
import PostModel from "../models/PostModel";
import { PostDeletionDurations } from "@/utils/consts";
import { getAuthenticatedUser } from "./AuthActions";

/**
 * Creates a new user in the database.
 * @param user - The user input data.
 * @returns A promise that resolves to the user object with extended ID.
 * @throws Will throw an error if the user creation fails.
 */
export async function createUser(user: UserInput): Promise<User> {
  await dbConnect();
  const parsedData = userSchema.parse(user);
  const newUser = await UserModel.create(parsedData);
  return newUser.toObject();
}

/**
 * Retrieves a user from the database by their ID.
 * @param id - The ID of the user to retrieve.
 * @returns A promise that resolves to the user object with extended ID.
 * @throws Will throw an error if the user is not found.
 */
export async function getUser(id: string): Promise<User> {
  await dbConnect();

  const user = await UserModel.findById(id);
  if (!user) {
    throw new Error("User not found");
  }
  return user.toObject();
}

/**
 * Retrieves a user from the database by their email.
 * @param email - The email of the user to retrieve.
 * @returns A promise that resolves to the user object with extended ID.
 * @throws Will throw an error if the user is not found.
 */
export async function getUserByEmail(email: string): Promise<User> {
  await dbConnect();

  const user = await UserModel.findOne({
    email: { $regex: new RegExp("^" + email + "$", "i") },
  });
  if (!user) {
    throw new Error("User not found");
  }
  return user.toObject();
}

export async function getUserBySalesforceUid(
  salesforceUid: string,
): Promise<User> {
  await dbConnect();

  const user = await UserModel.findOne({ salesforce_uid: salesforceUid });
  if (!user) {
    return user;
  }
  return user.toObject();
}

/**
 * Retrieves a user from the database by their ID with child disabilities populated.
 * @param id - The ID of the user to retrieve.
 * @returns A promise that resolves to the populated user object.
 * @throws Will throw an error if the user is not found.
 */
export async function getPopulatedUser(id: string): Promise<PopulatedUser> {
  await dbConnect();

  const user = await UserModel.findById(id)
    .populate({ path: "childDisabilities", model: "Disability" })
    .populate({ path: "defaultDisabilityTags", model: "Disability" })
    .populate({ path: "defaultDisabilityFilters", model: "Disability" });
  if (!user) {
    throw new Error("User not found");
  }
  return user.toObject();
}

/**
 * Retrieves all admin users from the database.
 * @returns A promise that resolves to an array of user objects with extended IDs.
 */
export async function getAdminUsers(): Promise<User[]> {
  await dbConnect();

  const adminUsers = await UserModel.find({ isAdmin: true });

  return !adminUsers || adminUsers.length === 0
    ? []
    : adminUsers.map((user) => user.toObject());
}

/**
 * Retrieves all banned users from the database.
 * @returns A promise that resolves to an array of user objects with extended IDs.
 */
export async function getBannedUsers(): Promise<User[]> {
  await dbConnect();

  const bannedUsers = await UserModel.find({ isBanned: true });

  return !bannedUsers || bannedUsers.length === 0
    ? []
    : bannedUsers.map((user) => user.toObject());
}

/**
 * Updates an existing user in the database.
 * @param id - The ID of the user to update.
 * @param updated - The partial user input data for updating.
 * @throws Will throw an error if the user update fails or if the user is not found.
 * @returns The updated user object.
 */
export async function editUser(
  id: string,
  updated: Partial<UserInput>,
): Promise<User> {
  await dbConnect();

  const parsedData = editUserSchema.parse(updated);

  const currentUser = await getAuthenticatedUser();
  if ((parsedData.isBanned) && !currentUser?.isAdmin) { // TODO: uncomment after demoing prod -- || parsedData.isAdmin
    throw new Error("Only admins can update a user's banned or admin status");
  }

  const updatedUser = await UserModel.findByIdAndUpdate(id, parsedData, {
    new: true,
  });
  if (!updatedUser) {
    throw new Error("User not found");
  }

  if (updated.postDeletionTimeline) {
    await PostModel.updateMany({ author: id }, [
      {
        $set: {
          expiresAt: {
            $add: [
              "$date",
              PostDeletionDurations[updated.postDeletionTimeline],
            ],
          },
        },
      },
    ]);
  }

  revalidatePath(`/family/${id}`);
  return updatedUser.toObject();
}
