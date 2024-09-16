'use server'

import { editUserSchema, User, UserInput } from "@/utils/types/user";
import UserModel from "../models/UserModel";
import dbConnect from "../dbConnect";
import { ExtendId } from "@/utils/types/common";

export async function createUser(user: UserInput): Promise<User> {
  await dbConnect();
  const newUser = await UserModel.create(user);
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
 * Updates an existing user in the database.
 * @param id - The ID of the user to update.
 * @param updated - The partial user input data for updating.
 * @throws Will throw an error if the user update fails or if the user is not found.
 * @returns The updated user object.
 */
export async function editUser(id: string, updated: Partial<UserInput>): Promise<User> {
  await dbConnect();

  const parsedData = editUserSchema.parse(updated);
  const updatedUser = await UserModel.findByIdAndUpdate(id, parsedData, { new: true });
  if (!updatedUser) {
    throw new Error("User not found");
  }
  return updatedUser.toObject();
}