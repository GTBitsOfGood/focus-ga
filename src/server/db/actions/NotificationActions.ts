"use server";

import {
  NotificationInput,
  notificationSchema,
} from "@/utils/types/notification";
import NotificationModel from "../models/NotificationModel";
import dbConnect from "../dbConnect";
import mongoose from "mongoose";
import { getAuthenticatedUser } from "./AuthActions";

export async function createNotification(
  notification: NotificationInput,
): Promise<Notification> {
  try {
    await dbConnect();

    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      throw new Error("User does not have access");
    }

    const parsedData = notificationSchema.parse(notification);
    const createdNotification = await NotificationModel.create(parsedData);

    return createdNotification.toObject();
  } catch (e) {
    console.log(e);
    throw new Error("Failed to create notification");
  }
}

export async function deleteNotification(comment_id: string): Promise<void> {
  try {
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(comment_id)) {
      throw new Error("Invalid comment ID");
    }

    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      throw new Error("User does not have access");
    }

    const result = await NotificationModel.findOneAndDelete({
      comment: comment_id,
    });

    if (!result) {
      throw new Error("Notification not found");
    }
  } catch (e) {
    throw new Error("Failed to delete notification");
  }
}
