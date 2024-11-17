// netlify/functions/hello.mts
import { Handler } from '@netlify/functions';
import juno from "juno-sdk";
import NotificationModel from "../../src/server/db/models/NotificationModel";
import dbConnect from "../../src/server/db/dbConnect";
import CommentModel from "../../src/server/db/models/CommentModel";
import PostModel from "../../src/server/db/models/PostModel";
import DisabilityModel from "../../src/server/db/models/DisabilityModel";
import UserModel from "../../src/server/db/models/UserModel";
import { deleteNotification } from "../../src/server/db/actions/NotificationActions";
import { getUser } from "../../src/server/db/actions/UserActions";
import { PopulatedComment } from "../../src/utils/types/comment";
import mongoose from "mongoose";

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
    // Log incoming event details for debugging purposes
    await dbConnect();
    console.log(mongoose.models);
    const disabilities = await DisabilityModel.find({});
    console.log(disabilities);
    console.log(DisabilityModel);
    console.log(UserModel);
    const users = await UserModel.find({});
    // console.log(users);
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
      // const user = await UserModel.findById(userId);
      // if (!user || !user.email || !user.notificationPreference) {
      //   for (const commentId of usersToNotify[userId]) {
      //     try {
      //       await deleteNotification(commentId);
      //     } catch (error) {
      //       console.error(`Failed to delete notification for comment ${commentId}:`, error);
      //     }
      //   }
      // } else {
      const emailContents = await generateEmailContents(usersToNotify[userId]);
      const response = await juno.email.sendEmail({
        recipients: [
          {
            email: "emilyliu.us@gmail.com",
            name: `test Family`,
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
      console.log("here3")

      // delete notifications associated with successfully sent emails
      for (const commentId of usersToNotify[userId]) {
        try {
          await deleteNotification(commentId);
        } catch (error) {
          console.error(`Failed to delete notification for comment ${commentId}:`, error);
        }
      }
      // }
    }


    // Sample responses
    const response = {
      message: "Hello, this is a sample Netlify function!",
      eventDetails: event,
    };
    return {
      statusCode: 200, // HTTP success status code
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error occurred:", error);
    return {
      statusCode: 500, // HTTP server error status code
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
export { handler };