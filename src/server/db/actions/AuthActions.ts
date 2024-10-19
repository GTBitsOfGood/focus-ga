'use server';

import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from "@/lib/session";
import { getUser } from './UserActions';
import { PopulatedUser } from '@/utils/types/user';

export async function getAuthenticatedUser(): Promise<PopulatedUser | null> {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  if (!session.isLoggedIn) {
    return null;
  }

  const user = await getUser(session.userId);

  return user;
}