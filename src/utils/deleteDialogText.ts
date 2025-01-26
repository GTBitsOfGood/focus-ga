export const deleteDialogText = {
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
} as const;
