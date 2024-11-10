import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import { cookies } from "next/headers";

/**
 * Middleware to handle session-based redirects.
 * 
 * Redirects authenticated users away from the login page to the home page.
 * Redirects unauthenticated users to the login page from any other page.
 * 
 * @param request - The incoming Next.js request object.
 * @returns A Next.js response object that either redirects or allows the request to proceed.
 */
export async function middleware(request: NextRequest) {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  
  if (request.nextUrl.pathname === "/login" && session.isLoggedIn) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (request.nextUrl.pathname !== "/login" && !session.isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/posts/:path*', '/family/:path*', '/login'],
};