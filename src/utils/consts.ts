export const MAX_POST_TITLE_LEN = 100;
export const MAX_POST_CONTENT_LEN = 5000;
export const MAX_POST_DISABILITY_TAGS = 5;
export const MAX_FILTER_DISABILITY_TAGS = 3;
export const MAX_DESCRIPTION_LEN = 200;
export const MIN_FILTER_AGE = 0;
export const MAX_FILTER_AGE = 20;

export const PAGINATION_LIMIT = 10;

export enum PostDeletionTimeline {
  OneMonth = "1 month",
  ThreeMonths = "3 months",
  SixMonths = "6 months",
  OneYear = "1 year",
  TwoYears = "2 years",
  FourYears = "4 years",
}

// Deletion durations in milliseconds
export const PostDeletionDurations = {
  [PostDeletionTimeline.OneMonth]: 30 * 24 * 60 * 60 * 1000,
  [PostDeletionTimeline.ThreeMonths]: 90 * 24 * 60 * 60 * 1000,
  [PostDeletionTimeline.SixMonths]: 180 * 24 * 60 * 60 * 1000,
  [PostDeletionTimeline.OneYear]: 365 * 24 * 60 * 60 * 1000,
  [PostDeletionTimeline.TwoYears]: 2 * 365 * 24 * 60 * 60 * 1000,
  [PostDeletionTimeline.FourYears]: 4 * 365 * 24 * 60 * 60 * 1000,
} as const;

export enum ProfileColors {
  ProfileOrange = "profile-orange",
  ProfileYellow = "profile-yellow",
  ProfileGreen = "profile-green",
  ProfileTeal = "profile-teal",
  ProfileIndigo = "profile-indigo",
  ProfileDefault = "profile-pink",
}

export function generateRandomColor(): ProfileColors {
  const colors = Object.values(ProfileColors);
  return colors[Math.floor(Math.random() * colors.length)];
}
