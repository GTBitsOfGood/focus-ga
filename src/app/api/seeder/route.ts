import { faker } from "@faker-js/faker";
import dbConnect from "@/server/db/dbConnect";
import CommentLikeModel from "@/server/db/models/CommentLikeModel";
import CommentModel from "@/server/db/models/CommentModel";
import DisabilityModel from "@/server/db/models/DisabilityModel";
import PostLikeModel from "@/server/db/models/PostLikeModel";
import PostModel from "@/server/db/models/PostModel";
import PostSaveModel from "@/server/db/models/PostSaveModel";
import ReportModel from "@/server/db/models/ReportModel";
import UserModel from "@/server/db/models/UserModel";
import { createDisability } from "@/server/db/actions/DisabilityActions";
import { createUser } from "@/server/db/actions/UserActions";
import {
  createPost,
  createPostLike,
  createPostSave,
} from "@/server/db/actions/PostActions";
import {
  createComment,
  createCommentLike,
} from "@/server/db/actions/CommentActions";
import { createReport } from "@/server/db/actions/ReportActions";
import { ReportReason, ContentType } from "@/utils/types/report";
import { CommentInput } from "@/utils/types/comment";
import { GEORGIA_CITIES } from "@/utils/cities";
import { ProfileColors } from "@/utils/consts";

const DISABILITIES = [
  "ADHD",
  "Anxiety Disorder",
  "Arthritis",
  "Autism Spectrum Disorder",
  "Bipolar Disorder",
  "Cerebral Palsy",
  "Chronic Fatigue Syndrome",
  "Chronic Pain Syndrome",
  "Crohn's Disease",
  "Depression",
  "Dyslexia",
  "Epilepsy",
  "Fibromyalgia",
  "Hearing Impairment",
  "Intellectual Disability",
  "Learning Disabilities",
  "Multiple Sclerosis",
  "Muscular Dystrophy",
  "Obsessive-Compulsive Disorder",
  "Parkinson's Disease",
  "Post-Traumatic Stress Disorder",
  "Rett Syndrome",
  "Schizophrenia",
  "Sickle Cell Disease",
  "Spina Bifida",
  "Spinal Muscular Atrophy",
  "Stroke",
  "Tourette Syndrome",
  "Traumatic Brain Injury",
  "Ulcerative Colitis",
  "Visual Impairment",
  "Alzheimer's Disease",
  "Amputation/Limb Loss",
  "Asthma",
  "Cancer (various types)",
  "Diabetes (Type 1 and 2)",
  "Heart Disease",
  "High Blood Pressure",
  "Hyperlexia",
  "Irritable Bowel Syndrome (IBS)",
  "Obesity",
  "Osteoarthritis",
  "Post-Concussion Syndrome",
  "Seizure Disorders",
  "Sleep Apnea",
  "Thyroid Disorders",
  "Vertigo",
  "Autism",
  "Cystic Fibrosis",
  "Down Syndrome",
  "Fragile X Syndrome",
];
const NUM_USERS = 100;
const MAX_CHILD_AGE = 20;
const MAX_POSTS_PER_USER = 10;
const MAX_USER_DISABILITIES = 3;
const MAX_COMMENTS_PER_POST = 15;
const MAX_LIKED_SAVED_POSTS_PER_USER = 20;
const MAX_LIKED_COMMENTS_PER_USER = 20;
const NUM_REPORTS = 20;
const NUM_REPORT_REASONS = 4;
const NUM_CONTENT_TYPES = 3;
const MAX_POST_TAGS = 2;

export async function POST(request: Request) {
  try {
    await dbConnect();

    // clear the database
    await CommentLikeModel.deleteMany({});
    await CommentModel.deleteMany({});
    await DisabilityModel.deleteMany({});
    await PostLikeModel.deleteMany({});
    await PostModel.deleteMany({});
    await PostSaveModel.deleteMany({});
    await ReportModel.deleteMany({});
    await UserModel.deleteMany({});
    console.log("Successfully cleared database.");

    // create disabilities
    const disabilityIds = [];
    for (const disability of DISABILITIES) {
      const id = (await createDisability({ name: disability }))._id;
      disabilityIds.push(id);
    }
    console.log("Successfully created disabilities.");

    // create users
    const users = [];
    for (let i = 0; i < NUM_USERS; i++) {
      const randomDisabilityCount =
        Math.floor(Math.random() * MAX_USER_DISABILITIES) + 1;
      const availableDisabilities = [...disabilityIds];
      const selectedDisabilities: string[] = [];

      for (let i = 0; i < randomDisabilityCount; i++) {
        const randomIndex = Math.floor(Math.random() * 3);
        selectedDisabilities.push(availableDisabilities[randomIndex]);
        availableDisabilities.splice(randomIndex, 1);
      }

      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const username = faker.internet.userName({
        firstName: firstName,
        lastName: lastName,
      });
      const email = faker.internet.email({
        firstName: firstName,
        lastName: lastName,
      });
      const cityIndex = Math.floor(Math.random() * GEORGIA_CITIES.length);
      const getRandomProfileColor = () => {
        const colors = Object.values(ProfileColors);
        return colors[Math.floor(Math.random() * colors.length)];
      };

      const userInfo = {
        username: username,
        isAdmin: false,
        isBanned: false,
        lastName: lastName,
        email: email,
        childAge: Math.floor(Math.random() * MAX_CHILD_AGE),
        childDisabilities: selectedDisabilities,
        city: GEORGIA_CITIES[cityIndex],
        bio: faker.lorem.paragraph({ min: 1, max: 6 }),
        profileColor: getRandomProfileColor(),
        salesforce_uid: email,
      };

      users.push(await createUser(userInfo));
    }
    console.log("Successfully created users");

    // create posts
    const posts = [];
    for (const user of users) {
      const userId = user._id;
      const numberOfPosts = Math.floor(
        Math.random() * (MAX_POSTS_PER_USER + 1),
      );

      for (let i = 0; i < numberOfPosts; i++) {
        const randomDisabilityCount = Math.floor(
          Math.random() * Math.min(DISABILITIES.length, MAX_POST_TAGS) + 1,
        );
        const availableDisabilities = [...disabilityIds];
        const selectedDisabilities: string[] = [];

        for (let j = 0; j < randomDisabilityCount; j++) {
          const randomIndex = Math.floor(
            Math.random() * availableDisabilities.length,
          );
          selectedDisabilities.push(availableDisabilities[randomIndex]);
          availableDisabilities.splice(randomIndex, 1);
        }

        const postInfo = {
          author: userId,
          date: Math.random() < 0.5 ? faker.date.past({ years: 4 }) : undefined,
          title: faker.word.words({ count: { min: 3, max: 10 } }),
          content: faker.lorem.paragraph({ min: 3, max: 10 }),
          tags: selectedDisabilities,
          isPinned: false,
          isPrivate: Math.random() < 0.5 ? true : false,
          isFlagged: Math.random() < 0.5 ? true : false,
          isDeleted: false,
        };

        posts.push(await createPost(postInfo));
      }
    }
    console.log("Successfully created posts");

    // create comments
    const comments = [];
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const numberOfComments = Math.floor(
        Math.random() * (MAX_COMMENTS_PER_POST + 1),
      );
      const postComments = [];

      for (let j = 0; j < numberOfComments; j++) {
        const commentInfo: CommentInput = {
          author: users[Math.floor(Math.random() * users.length)]._id,
          post: post._id,
          date: faker.date.between({ from: post.date, to: new Date() }),
          content: faker.lorem.sentences(),
          isFlagged: Math.random() < 0.5 ? true : false,
          isDeleted: false,
        };

        if (postComments.length > 0) {
          const randomIndex = Math.floor(Math.random() * postComments.length);
          if (
            commentInfo.date &&
            postComments[randomIndex].date < commentInfo.date
          ) {
            commentInfo.replyTo = postComments[randomIndex]._id;
          }
        }
        const newComment = await createComment(commentInfo);
        postComments.push(newComment);
        comments.push(newComment);
      }
    }
    console.log("Successfully created comments");

    // create liked and saved posts
    for (const user of users) {
      const numberOfLiked = Math.floor(
        Math.random() * (MAX_LIKED_SAVED_POSTS_PER_USER + 1),
      );
      let indexOptions = Array.from(posts.keys());

      for (let i = 0; i < numberOfLiked; i++) {
        const randomIndex = Math.floor(Math.random() * indexOptions.length);
        const postIndex = indexOptions[randomIndex];
        indexOptions.splice(randomIndex, 1);

        await createPostLike(user._id, posts[postIndex]._id);
      }

      const numberOfSaved = MAX_LIKED_SAVED_POSTS_PER_USER - numberOfLiked;
      indexOptions = Array.from(posts.keys());
      for (let i = 0; i < numberOfSaved; i++) {
        const randomIndex = Math.floor(Math.random() * indexOptions.length);
        const postIndex = indexOptions[randomIndex];
        indexOptions.splice(randomIndex, 1);

        await createPostSave(user._id, posts[postIndex]._id);
      }
    }
    console.log("Successfully created liked and saved posts.");

    // create liked comments
    for (const user of users) {
      const numberOfLiked = Math.floor(
        Math.random() * (MAX_LIKED_COMMENTS_PER_USER + 1),
      );
      let indexOptions = Array.from(comments.keys());

      for (let i = 0; i < numberOfLiked; i++) {
        const randomIndex = Math.floor(Math.random() * indexOptions.length);
        const commentIndex = indexOptions[randomIndex];
        indexOptions.splice(randomIndex, 1);

        await createCommentLike(user._id, comments[commentIndex]._id);
      }
    }
    console.log("Sucessfully created liked comments.");

    // create reports
    const reasons = Object.values(ReportReason);
    const types = Object.values(ContentType);
    for (let i = 0; i < NUM_REPORTS; i++) {
      const sourceUser = users[Math.floor(Math.random() * users.length)];

      let reportedContent;
      let reportedUser;
      const reasonIndex = Math.floor(Math.random() * NUM_REPORT_REASONS);
      const typeIndex = Math.floor(Math.random() * NUM_CONTENT_TYPES);

      if (typeIndex == 0) {
        // report user
        reportedContent = users[Math.floor(Math.random() * users.length)];
        reportedUser = reportedContent._id;
      } else if (typeIndex == 1) {
        // report comment
        reportedContent = comments[Math.floor(Math.random() * comments.length)];
        reportedUser = reportedContent.author;
      } else {
        // report post
        reportedContent = posts[Math.floor(Math.random() * posts.length)];
        reportedUser = reportedContent.author;
      }

      const reportInfo = {
        reason: reasons[reasonIndex],
        description: faker.lorem.sentences(),
        reportedUser: reportedUser.toString(),
        sourceUser: sourceUser._id.toString(),
        reportedContent: reportedContent._id.toString(),
        contentType: types[typeIndex],
      };

      await createReport(reportInfo);
    }
    console.log("Successfully created reports");
  } catch (e) {
    console.log(e);
    throw e;
  }

  console.log("Successfully seeded database.");
  return Response.json({ status: 200 });
}
