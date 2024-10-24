'use server';

import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from "@/lib/session";
import { getUser, signOut } from './UserActions';
import { User } from '@/utils/types/user';
import { redirect } from 'next/navigation';

/**
 * Retrieves the authenticated user from the session.
 * If the user is not logged in, this function returns null.
 * @returns The authenticated user, or null if not logged in.
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  if (!session.isLoggedIn) {
    return null;
  }

  try {
    const user = await getUser(session.userId);
    return user;
  } catch (e) {
    await signOut();
    redirect('/login');
  }
}
