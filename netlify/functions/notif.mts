import { Handler, Config } from '@netlify/functions';
import juno from 'juno-sdk';
import NotificationModel from '../../src/server/db/models/NotificationModel';
import dbConnect from '../../src/server/db/dbConnect';
// import CommentModel from '../../src/server/db/models/CommentModel';
// import PostModel from '../../src/server/db/models/PostModel';
// import UserModel from '../../src/server/db/models/UserModel';
// import { deleteNotification } from '../../src/server/db/actions/NotificationActions';
// import { PopulatedComment } from '../../src/utils/types/comment';

// async function generateEmailContents(commentIds: string[]) {
//   const postsToComments: { [postId: string]: PopulatedComment[] } = {};
//   let content = "";

//   const comments = await CommentModel.find({ _id: { $in: commentIds } }).populate('author');

//   for (const comment of comments) {
//     const postId = comment.post._id.toString();
//     if (!postsToComments[postId]) {
//       postsToComments[postId] = [];
//     }
//     postsToComments[postId].push(comment);
//   }

//   for (const postId in postsToComments) {
//     const post = await PostModel.findById(postId); // Fetch the post title
//     if (post) {
//       content += `<strong>${post.title}</strong><br>`;
//       const postComments = postsToComments[postId];

//       for (const comment of postComments) {
//         content += `${comment.author?.lastName} family commented: ${comment.content}<br>`;
//       }

//       content += "<br><br>";
//     }
//   }

//   return {
//     type: "text/html",
//     value: content,
//   };
// }

const handler: Handler = async(event, context) => {
  try {
    console.log('juno init')
    juno.init({
      apiKey: process.env.JUNO_API_KEY as string,
      baseURL: "https://api-gateway.whitesmoke-cea9a269.eastus.azurecontainerapps.io"
    })

    // Fetch notifications and group by user
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
    console.log(notifications)

    const response = {
      message: "hello",
      eventDetails: event
    }

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    }
  } catch (error) {
    console.error('Error sending notifications:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({error: "Error sending notifications"})
    }
  }
}

export const config: Config = {
  schedule: '00 18 * * *', // 12:45 PM EST (5:45 PM UTC)
};

export default handler;