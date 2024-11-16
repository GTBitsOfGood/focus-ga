import type { Config } from "@netlify/functions"
import { Handler } from '@netlify/functions';
import NotificationModel from "@/server/db/models/NotificationModel";
import UserModel from "@/server/db/models/UserModel";
import juno from "juno-sdk";
import PostModel from "@/server/db/models/PostModel";
import CommentModel from "@/server/db/models/CommentModel";
import { PopulatedComment } from "@/utils/types/comment";
import { deleteNotification } from "@/server/db/actions/NotificationActions";

juno.init({
  apiKey: process.env.JUNO_API_KEY as string,
  baseURL: "https://api-gateway.whitesmoke-cea9a269.eastus.azurecontainerapps.io"
})

export async function generateEmailContents(commentIds: string[]) {
  const postsToComments: { [postId: string]: PopulatedComment[] } = {};
  let content = "";

  const comments = await CommentModel.find({ _id: { $in: commentIds } }).populate('author');

  for (const comment of comments) {
    const postId = comment.post._id.toString();
    if (!postsToComments[postId]) {
      postsToComments[postId] = [];
    }
    postsToComments[postId].push(comment);
  }

  for (const postId in postsToComments) {
    const post = await PostModel.findById(postId); // Fetch the post title
    if (post) {
      content += `<strong>${post.title}</strong><br>`;
      const postComments = postsToComments[postId];

      for (const comment of postComments) {
        content += `${comment.author?.lastName} family commented: ${comment.content}<br>`;
      }

      content += "<br><br>";
    }
  }

  return {
    type: "text/html",
    value: content,
  };
}

const handler: Handler = async(event, context) => {
  try {
    // Fetch notifications and group by user
    const notifications = await NotificationModel.find({});
    const usersToNotify: { [userId: string]: string[] } = {};

    for (const notification of notifications) {
      const userId = notification.author.toString();
      if (!usersToNotify[userId]) {
        usersToNotify[userId] = [];
      }
      usersToNotify[userId].push(notification.comment.toString());
    }

    for (const userId in usersToNotify) {
      const user = await UserModel.findById(userId);
      
      // user has opted out of notifications, delete currently stored
      if (!user || !user.email || !user.notificationPreference) {
        for (const commentId of usersToNotify[userId]) {
          try {
            await deleteNotification(commentId);
          } catch (error) {
            console.error(`Failed to delete notification for comment ${commentId}:`, error);
          }
        }
      } else {
        const emailContents = await generateEmailContents(usersToNotify[userId]);

        const response = await juno.email.sendEmail({
          recipients: [
            {
              email: "emilyliu.us@gmail.com",
              name: `${user.lastName} Family`,
            },
          ],
          bcc: [],
          cc: [],
          sender: {
            email: process.env.JUNO_SENDER_EMAIL as string,
            name: process.env.JUNO_SENDER_NAME as string,
          },
          subject: "FOCUS Community Updates",
          contents: [emailContents],
        });

        // delete notifications associated with successfully sent emails
        for (const commentId of usersToNotify[userId]) {
          try {
            await deleteNotification(commentId);
          } catch (error) {
            console.error(`Failed to delete notification for comment ${commentId}:`, error);
          }
        }
      }
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Notifications sent successfully' }),
    }
  } catch (error) {
    console.error('Error sending notifications:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({message: 'Error sending notifications'})
    }
  }
}

export const config: Config = {
  schedule: '00 18 * * *', // 12:45 PM EST (5:45 PM UTC)
};

export default handler;