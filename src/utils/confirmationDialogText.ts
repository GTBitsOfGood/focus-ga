export const ConfirmationDialogText = {
  post: {
    description:
      "Are you sure you want to delete this post? This action cannot be undone!",
    button: "Delete",
    loading: "Deleting...",
  },
  comment: {
    description:
      "Are you sure you want to delete this comment? This action cannot be undone!",
    button: "Delete",
    loading: "Deleting...",
  },
  user: {
    description:
      "Are you sure you want to ban this user? They would not be able to view any future posts.",
    button: "Ban",
    loading: "Banning...",
  },
  ignore: {
    description:
      "Are you sure you want to ignore all reports for this content? This action cannot be undone!",
    button: "Ignore",
    loading: "Ignoring...",
  },
  changeDeletionTimeline: {
    description:
      "Are you sure you want to change your post deletion timeline? Any posts that you have posted over [duration] ago will be deleted forever.",
    button: "Change",
    loading: "Changing...",
  },
} as const;
