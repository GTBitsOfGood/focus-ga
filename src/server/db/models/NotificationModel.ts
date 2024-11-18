import mongoose, { Schema } from "mongoose";
import { AppNotification } from "@/utils/types/notification";

const NotificationSchema = new Schema<AppNotification>({
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    comment: { type: Schema.Types.ObjectId, ref: 'Comment', required: true},
    commenter: { type: Schema.Types.ObjectId, ref: 'User', required: true},
    createdAt: { type: Date, default: Date.now() },
})

const NotificationModel = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);

export default NotificationModel;