'use server'

import { editUserSchema, PopulatedUser, User, UserInput, userSchema } from "@/utils/types/user";
import UserModel from "../models/UserModel";
import dbConnect from "../dbConnect";
import { revalidatePath } from "next/cache";
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
export async function getUser(id: string): Promise<PopulatedUser> {
  await dbConnect();

  const user = await UserModel
    .findById(id)
    .populate({ path: 'childDisabilities', model: 'Disability' });
  if (!user) {
    throw new Error("User not found");
  }
  return user.toObject();
}

/**
 * Retrieves a user from the database by their username.
 * @param email - The email of the user to retrieve.
 * @returns A promise that resolves to the user object with extended ID.
 * @throws Will throw an error if the user is not found.
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  await dbConnect();

  const user = await UserModel.findOne({ email });
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

  revalidatePath(`/family/${id}`)
  return updatedUser.toObject();
}

/**
 * Logs in a user by their username. If the user does not exist, a new user is created with default values.
 * @param username - The username of the user attempting to log in.
 * @returns A promise that resolves to an object indicating the success of the login operation.
 */
export async function loginUser(email: string) {
  let user = await getUserByEmail(email);
  if (!user) {
    user = await createUser({ 
      email,
      username: "12738718",
      lastName: "BoG", 
      childAge: 10, 
      childDisabilities: [],
      city: "Fulton",
      bio: "Hello World!"
    });
  }

  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  session.userId = user._id.toString();
  session.isLoggedIn = true;
  await session.save();

  return { success: true };
}

/**
 * Signs out the current user by destroying their session.
 * @returns A promise that resolves to an object indicating the success of the sign-out operation.
 */
export async function signOut() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  
  session.destroy();
  return { success: true };
}
