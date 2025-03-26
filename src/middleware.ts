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
  const isSetupPage = request.nextUrl.pathname === "/" && request.nextUrl.searchParams.has("setup");

  const requestHeaders = new Headers(request.headers);
  const origin = requestHeaders.get('origin');

  console.log(request.url)
  if (origin && origin.includes('https://focus-ga.my.site.com')) {
    requestHeaders.set('x-forwarded-host', 'https://focus-ga.my.site.com');
    console.log("inside")
    return NextResponse.next({ request: { headers: requestHeaders } });
  }
  

  if (request.nextUrl.pathname === "/login" && session.isLoggedIn) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (request.nextUrl.pathname !== "/login" && !session.isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session.isLoggedIn && !session.setupComplete && !isSetupPage) {
    return NextResponse.redirect(new URL("/?setup=true", request.url));
  }

  if (session.setupComplete && isSetupPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/posts/:path*', '/family/:path*', '/login', '/api/sso/callback'],
};