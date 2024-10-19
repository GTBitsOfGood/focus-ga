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
  password: process.env.SESSION_SECRET!, // Make sure to set this in your .env file
  cookieName: "user-session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  },
};