'use server';

import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from "@/lib/session";
import { createUser, getPopulatedUser, getUserBySalesforceUid } from './UserActions';
import { PopulatedUser } from '@/utils/types/user';
import { redirect } from 'next/navigation';
import { generateRandomColor } from '@/utils/consts';
import dbConnect from "@/server/db/dbConnect";
import DisabilityModel from "@/server/db/models/DisabilityModel";
import { createDisability } from "@/server/db/actions/DisabilityActions";

/**
 * Retrieves the authenticated user from the session.
 * If the user is not logged in, this function returns null.
 * @returns The authenticated user, or null if not logged in.
 */
export async function getAuthenticatedUser(refresh = false): Promise<PopulatedUser | null> {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  if (!session.isLoggedIn) {
    return null;
  }

  try {
    const user = await getPopulatedUser(session.userId);
    return user;
  } catch (e) {
    await signOut();
    redirect('/login');
  }
}

/**
 * Logs in a user by their uid. If the user does not exist, a new user is created with default values and provided email and uid.
 * @param email - The username of the user attempting to log in.
 * @param uid - uid provided by salesforce
 * @returns A promise that resolves to an object indicating the success of the login operation.
 */
export async function loginUser(email: string, uid: string) {
  ping();
  let user = await getUserBySalesforceUid(uid);
  let isFirstTime = false
  if (!user) {
    isFirstTime = true
    const lastName = email.split('@')[0]; 
    user = await createUser({ 
      email,
      username: email,
      lastName, 
      childDisabilities: [],
      city: "Atlanta",
      bio: "",
      salesforce_uid: uid,
      profileColor: generateRandomColor(),
    });
  }

  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  session.userId = user._id.toString();
  session.isLoggedIn = true;
  await session.save();

  return { success: true, isFirstTime };
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

/**
 * Pings the database by creating and immediately deleting a dummy disability object.
 * @returns A response indicating the success of the operation.
 */
export async function ping() {
  try {
    await dbConnect();
    const dummyDisability = await createDisability({ name: "Ping" });
    console.log("Successfully created dummy disability:", dummyDisability._id);
    await DisabilityModel.findByIdAndDelete(dummyDisability._id);
    console.log("Successfully deleted dummy disability:", dummyDisability._id);
  } catch (error) {
    console.error("Error during database ping:", error);
    throw error;
  }
  return { status: 200, message: "Database ping successful" };
}