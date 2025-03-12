import { SessionOptions } from "iron-session";

export interface SessionData {
  userId: string;
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  userId: "",
  isLoggedIn: false,
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!, // Ensure this secret is at least 32 characters long.
  cookieName: "user-session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Only send cookie over HTTPS in production.
    sameSite: "lax", // Adjust to 'strict' or 'none' as needed for your app.
    path: "/", // Makes the cookie available across your entire site.
    // domain: process.env.COOKIE_DOMAIN, // Uncomment and set this if you have a custom domain.
    maxAge: 60 * 60 * 24 * 7, // Cookie expires in 7 days.
  },
};