'use server'

import { editUserSchema, User, UserInput, userSchema } from "@/utils/types/user";
import UserModel from "../models/UserModel";
import dbConnect from "../dbConnect";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import { cookies } from "next/headers";

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
 * Retrieves a user from the database by their username.
 * @param username - The username of the user to retrieve.
 * @returns A promise that resolves to the user object with extended ID.
 * @throws Will throw an error if the user is not found.
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  await dbConnect();

  const user = await UserModel.findOne({ username });
  if (!user) {
    return null;
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

export async function loginUser(username: string) {
  let user = await getUserByUsername(username);
  if (!user) {
    user = await createUser({ username, "lastName" : "dummy", "childAge" : 10, "childDisabilities" : [], "email" : "test@gmail.com", "county" : "fulton" }); // Adjust this to match your user schema
  }

  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  session.userId = user._id.toString();
  session.isLoggedIn = true;
  await session.save();

  return { success: true };
}

export async function signOut() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  
  session.destroy();
  return { success: true };
}
