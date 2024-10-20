import { Lato } from "next/font/google";

export const MAX_POST_TITLE_LEN = 100;
export const MAX_POST_CONTENT_LEN = 5000;
export const MAX_POST_DISABILITY_TAGS = 5;

export const PAGINATION_LIMIT = 10;

export const FOCUS_FONT = Lato({
  subsets: ['latin'],
  weight: ['100', '300', '400', '700', '900'],
});
