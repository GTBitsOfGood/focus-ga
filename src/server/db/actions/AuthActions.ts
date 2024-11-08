'use server';

import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from "@/lib/session";
import { getPopulatedUser, signOut } from './UserActions';
import { PopulatedUser } from '@/utils/types/user';
import { redirect } from 'next/navigation';

let user: PopulatedUser | null;

/**
 * Retrieves the authenticated user from the session.
 * If the user is not logged in, this function returns null.
 * @returns The authenticated user, or null if not logged in.
 */
export async function getAuthenticatedUser(refresh = false): Promise<PopulatedUser | null> {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  if (!session.isLoggedIn) {
    user = null;
    return null;
  }

  if (user && !refresh) {
    return user;
  }

  try {
    user = await getPopulatedUser(session.userId);
    return user;
  } catch (e) {
    await signOut();
    redirect('/login');
  }
}
