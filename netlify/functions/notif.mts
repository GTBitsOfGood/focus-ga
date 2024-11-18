// netlify/functions/hello.mts
import { Handler } from '@netlify/functions';
import { Config } from '@netlify/functions';
import juno from "juno-sdk";
import NotificationModel from "../../src/server/db/models/NotificationModel";
import dbConnect from "../../src/server/db/dbConnect";
import CommentModel from "../../src/server/db/models/CommentModel";
import PostModel from "../../src/server/db/models/PostModel";
import UserModel from "../../src/server/db/models/UserModel";
import { deleteNotification } from "../../src/server/db/actions/NotificationActions";
import { PopulatedComment } from "../../src/utils/types/comment";

async function generateEmailContents(commentIds: string[]) {
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

const handler: Handler = async (event, context) => {
  try {
    juno.init({
      apiKey: process.env.JUNO_API_KEY as string,
      baseURL: "https://api-gateway.whitesmoke-cea9a269.eastus.azurecontainerapps.io"
    });

    await dbConnect();
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
              email: `{user.email}`,
              name: `{user.lastName} Family`,
            },
          ],
          bcc: [],
          cc: [],
          sender: {
            email: process.env.JUNO_SENDER_EMAIL as string,
            name: process.env.JUNO_SENDER_NAME as string,
          },
          subject: "FOCUS Community Updates", // TODO: update
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
      body: JSON.stringify({ message: "Successfully sent email" }),
    };
  } catch (error) {
    console.error("Error occurred:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
export { handler };

export const config: Config = {
  schedule: "0 17 * * *" // schedule function to run at 5pm UTC every day
}