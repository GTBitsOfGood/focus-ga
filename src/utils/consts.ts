import { Lato } from "next/font/google";

export const MAX_POST_TITLE_LEN = 100;
export const MAX_POST_CONTENT_LEN = 5000;
export const MAX_POST_DISABILITY_TAGS = 5;
export const MAX_FILTER_DISABILITY_TAGS = 3;
export const MAX_DESCRIPTION_LEN = 200;

export const PAGINATION_LIMIT = 10;

export const FOCUS_FONT = Lato({
  subsets: ['latin'],
  weight: ['100', '300', '400', '700', '900'],
});

export enum PostDeletionTimeline {
  OneMonth = '1 month',
  ThreeMonths = '3 months',
  SixMonths = '6 months',
  OneYear = '1 year',
  TwoYears = '2 years',
  FourYears = '4 years',
};

export enum ProfileColors {
  ProfileOrange = 'profile-orange',
  ProfileYellow = 'profile-yellow',
  ProfileGreen = 'profile-green',
  ProfileTeal = 'profile-teal',
  ProfileIndigo = 'profile-indigo',
  ProfileDefault = 'profile-pink',
};
