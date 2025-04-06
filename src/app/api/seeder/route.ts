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
import NotificationModel from "@/server/db/models/NotificationModel";
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
import { PostDeletionDurations, ProfileColors } from "@/utils/consts";
import dayjs from "dayjs";

const DISABILITIES = [
  "ADHD",
  "Addison's Disease",
  "Aicardi Syndrome",
  "Albinism",
  "Alzheimer's Disease",
  "Amputation/Limb Loss",
  "Angelman Syndrome",
  "Anxiety Disorder",
  "Apraxia of Speech",
  "Apert Syndrome",
  "Arthritis",
  "Asthma",
  "Autism",
  "Autism Spectrum Disorder",
  "Bipolar Disorder",
  "Cancer (various types)",
  "Canavan Disease",
  "Cerebellar Ataxia",
  "Cerebral Palsy",
  "CHARGE Syndrome",
  "Chronic Fatigue Syndrome",
  "Chronic Pain Syndrome",
  "Color Blindness",
  "Common Variable Immunodeficiency (CVID)",
  "Conduct Disorder",
  "Cornelia de Lange Syndrome",
  "Cortical Visual Impairment (CVI)",
  "Cri du Chat Syndrome",
  "Crohn's Disease",
  "Cystic Fibrosis",
  "Dandy-Walker Syndrome",
  "Depression",
  "Diabetes (Type 1 and 2)",
  "DiGeorge Syndrome",
  "Disruptive Mood Dysregulation Disorder",
  "Down Syndrome",
  "Dyslexia",
  "Ehlers-Danlos Syndrome",
  "Encephalitis",
  "Epilepsy",
  "Erb's Palsy",
  "Fetal Alcohol Spectrum Disorder (FASD)",
  "Fibromyalgia",
  "Fragile X Syndrome",
  "Heart Disease",
  "Hearing Impairment",
  "High Blood Pressure",
  "Huntington's Disease",
  "Hydrocephalus",
  "Hyperlexia",
  "Immunosensitivity",
  "Intellectual Disability",
  "Irritable Bowel Syndrome (IBS)",
  "Joint Hypermobility Syndrome",
  "Kabuki Syndrome",
  "Klinefelter Syndrome",
  "Learning Disabilities",
  "Lupus",
  "Maple Syrup Urine Disease",
  "Mast Cell Activation Syndrome (MCAS)",
  "Menkes Disease",
  "Migraines (Chronic)",
  "Mitochondrial Disease",
  "Morquio Syndrome",
  "Moyamoya Disease",
  "Multiple Sclerosis",
  "Muscular Dystrophy",
  "Neurofibromatosis",
  "Noonan Syndrome",
  "Obsessive-Compulsive Disorder",
  "Obesity",
  "Oppositional Defiant Disorder (ODD)",
  "Osteoarthritis",
  "Osteogenesis Imperfecta (Brittle Bone Disease)",
  "Other",
  "Parkinson's Disease",
  "Phelan-McDermid Syndrome",
  "Phenylketonuria (PKU)",
  "Poliomyelitis",
  "Post-Concussion Syndrome",
  "Post-Traumatic Stress Disorder",
  "Prader-Willi Syndrome",
  "Primary Immunodeficiency (PID)",
  "Rasmussen’s Encephalitis",
  "Rett Syndrome",
  "Retinitis Pigmentosa",
  "Rheumatoid Arthritis",
  "Schizophrenia",
  "Seizure Disorders",
  "Selective Mutism",
  "Sensory Processing Disorder",
  "Severe Allergies",
  "Sickle Cell Disease",
  "Sleep Apnea",
  "Smith-Magenis Syndrome",
  "Social Communication Disorder",
  "Spina Bifida",
  "Spinal Muscular Atrophy",
  "Speech Sound Disorder",
  "Strep-Triggered PANDAS/PANS",
  "Stuttering",
  "Sturge-Weber Syndrome",
  "Stroke",
  "Thyroid Disorders",
  "Tourette Syndrome",
  "Traumatic Brain Injury",
  "Turner Syndrome",
  "Tuberous Sclerosis",
  "Ulcerative Colitis",
  "Vertigo",
  "Visual Impairment",
  "Voice Disorders",
  "Williams Syndrome",
  "Wolf-Hirschhorn Syndrome"
];
const NUM_USERS = 10;
const MAX_CHILD_AGE = 20;
const MAX_CHILD_BIRTHDATES_PER_USER = 10;
const MAX_POSTS_PER_USER = 8;
const MAX_USER_DISABILITIES = 3;
const MAX_COMMENTS_PER_POST = 5;
const MAX_LIKED_SAVED_POSTS_PER_USER = 10;
const MAX_LIKED_COMMENTS_PER_USER = 10;
const NUM_REPORTS = 6;
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
    await NotificationModel.deleteMany({});
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
      let cityIndex = Math.floor(Math.random() * GEORGIA_CITIES.length);
      while (GEORGIA_CITIES[cityIndex] === "N/A") {
        cityIndex = Math.floor(Math.random() * GEORGIA_CITIES.length);
      }
      const getRandomProfileColor = () => {
        const colors = Object.values(ProfileColors);
        return colors[Math.floor(Math.random() * colors.length)];
      };

      const childBirthdates: Date[] = [];
      const today = new Date();
      const randomBirthdatesCount =
        Math.floor(Math.random() * MAX_CHILD_BIRTHDATES_PER_USER) + 1;
      const maxDate = new Date(
        today.getFullYear() - MAX_CHILD_AGE,
        today.getMonth(),
        today.getDate(),
      );
      for (let i = 0; i < randomBirthdatesCount; i++) {
        const minDate = today;
        childBirthdates.push(
          new Date(
            maxDate.getTime() +
              Math.random() * (minDate.getTime() - maxDate.getTime()),
          ),
        );
      }

      const userInfo = {
        username: username,
        isAdmin: false,
        isBanned: false,
        lastName: lastName,
        email: email,
        childBirthdates: childBirthdates,
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

        const creationDate: Date =
          Math.random() < 0.5 ? faker.date.past({ years: 4 }) : new Date();

        const postInfo = {
          author: userId,
          date: creationDate,
          title: faker.word.words({ count: { min: 3, max: 10 } }),
          content: faker.lorem.paragraph({ min: 3, max: 10 }),
          tags: selectedDisabilities,
          isPinned: false,
          isPrivate: Math.random() < 0.5 ? true : false,
          isFlagged: Math.random() < 0.5 ? true : false,
          isDeleted: false,
          expiresAt: dayjs(creationDate).add(4, "years").toDate(),
          editedByAdmin: false,
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
