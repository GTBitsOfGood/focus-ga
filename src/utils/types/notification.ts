import { z } from "zod";
import { Types } from "mongoose";
import { ExtendId } from "./common";

export const notificationSchema = z.object({
  author: z.string().transform(id => new Types.ObjectId(id)),
  post: z.string().transform(id => new Types.ObjectId(id)),
  comment: z.string().transform(id => new Types.ObjectId(id)),
  commenter: z.string().transform(id => new Types.ObjectId(id)),
  createdAt: z.date().default(new Date()),
})

export type AppNotification = ExtendId<z.infer<typeof notificationSchema>>;
export type NotificationInput = z.input<typeof notificationSchema>;