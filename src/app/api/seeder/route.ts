import { faker } from '@faker-js/faker';
import dbConnect from "@/server/db/dbConnect";
import CommentLikeModel from '@/server/db/models/CommentLikeModel';
import CommentModel from '@/server/db/models/CommentModel';
import DisabilityModel from '@/server/db/models/DisabilityModel';
import PostLikeModel from '@/server/db/models/PostLikeModel';
import PostModel from '@/server/db/models/PostModel';
import PostSaveModel from '@/server/db/models/PostSaveModel';
import ReportModel from '@/server/db/models/ReportModel';
import UserModel from '@/server/db/models/UserModel';
import { createDisability } from '@/server/db/actions/DisabilityActions';
import { createUser } from '@/server/db/actions/UserActions';
import { createPost, createPostLike, createPostSave } from '@/server/db/actions/PostActions';
import { createComment, createCommentLike } from '@/server/db/actions/CommentActions';
import { createReport } from '@/server/db/actions/ReportActions';
import { ReportReason, ContentType } from '@/utils/types/report';

const disabilities = ["Cerebral Palsy", "Autism Spectrum Disorder", "Down Syndrome", "Spina Bifida", "Muscular Dystrophy", "Rett Syndrome", "Fragile X Syndrome", "Epilepsy", "ADHD", "Spinal Muscular Atrophy"];

export async function POST(request: Request) {
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
  
  // create disabilities
  const disabilityIds = []
  for (const disability of disabilities) {
    const id = (await createDisability({ name: disability }))._id;
    disabilityIds.push(id);
  }

  // create users
  const users = [];
  for (let i = 0; i < 10; i++) {
    const randomDisabilityCount = Math.floor(Math.random() * 10) + 1;
    const availableDisabilities = [...disabilityIds];
    const selectedDisabilities: string[] = [];

    for (let i = 0; i < randomDisabilityCount; i++) {
      const randomIndex = Math.floor(Math.random() * availableDisabilities.length);
      selectedDisabilities.push(disabilityIds[randomIndex]);
      availableDisabilities.splice(randomIndex, 1); // Remove selected number to avoid duplicates
    }

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet.userName({ firstName: firstName, lastName: lastName })
    const email = faker.internet.email({ firstName: firstName, lastName: lastName });

    const userInfo = {
      username: username,
      lastName: lastName,
      email: email,
      childAge: Math.floor(Math.random() * (20)) + 1, // generates random age between 1 and 20
      childDisabilities: selectedDisabilities,
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
      }
    }

    users.push((await createUser(userInfo)));
  }

  // create posts
  const posts = [];
  for (const user of users) {
    const userId = user._id;
    const numberOfPosts = Math.floor(Math.random() * (6));

    for (let i = 0; i < numberOfPosts; i++) {
      const randomDisabilityCount = Math.floor(Math.random() * 10) + 1;
      const availableDisabilities = [...disabilityIds];
      const selectedDisabilities: string[] = [];

      for (let j = 0; j < randomDisabilityCount; j++) {
        const randomIndex = Math.floor(Math.random() * availableDisabilities.length);
        selectedDisabilities.push(disabilityIds[randomIndex]);
        availableDisabilities.splice(randomIndex, 1); // Remove selected number to avoid duplicates
      }

      const postInfo = {
        author: userId, 
        date: Math.random() < 0.5 ? faker.date.past({ years: 4 }) : undefined,
        title: faker.word.words({count: { min: 3, max: 14 }}),
        content: faker.lorem.paragraph({ min: 3, max: 10 }),
        tags: selectedDisabilities,
        isPinned: Math.random() < 0.5 ? true : false,
        isPrivate: Math.random() < 0.5 ? true : false,
        isFlagged: Math.random() < 0.5 ? true : false,
      }

      posts.push(((await createPost(postInfo))));
    }
  }

  // create comments
  // TODO: make some comments replies
  const comments = [];
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const numberOfComments = Math.floor(Math.random() * 6);

    for (let j = 0; j < numberOfComments; j++) {
      const commentInfo = {
        author: users[Math.floor(Math.random() * users.length)]._id,
        post: post._id,
        date: faker.date.between({ from: post.date, to: new Date(), }),
        content: faker.lorem.sentences(),
      }
      comments.push(await createComment(commentInfo));
    }
  }

  // create liked and saved posts
  for (const user of users) {
    const numberOfLiked = Math.floor(Math.random() * 6);
    let indexOptions = Array.from(posts.keys());

    for (let i = 0; i < numberOfLiked; i++) {
      const randomIndex = Math.floor(Math.random() * indexOptions.length);
      const postIndex = indexOptions[randomIndex];
      indexOptions.splice(randomIndex, 1);

      await createPostLike(user._id, posts[postIndex]._id);
    }

    const numberOfSaved = 5 - numberOfLiked;
    indexOptions = Array.from(posts.keys());
    for (let i = 0; i < numberOfSaved; i++) {
      const randomIndex = Math.floor(Math.random() * indexOptions.length);
      const postIndex = indexOptions[randomIndex];
      indexOptions.splice(randomIndex, 1);

      await createPostSave(user._id, posts[postIndex]._id);
    }
  }

  // create liked comments
  for (const user of users) {
    const numberOfLiked = Math.floor(Math.random() * 6);
    let indexOptions = Array.from(comments.keys());

    for (let i = 0; i < numberOfLiked; i++) {
      const randomIndex = Math.floor(Math.random() * indexOptions.length);
      const commentIndex = indexOptions[randomIndex];
      indexOptions.splice(randomIndex, 1);

      await createCommentLike(user._id, comments[commentIndex]._id);
    }
  }

  // create reports
  for (let i = 0; i < 10; i++) {
    const reasons = Object.values(ReportReason);
    const types = Object.values(ContentType);
    const sourceUser = users[Math.floor(Math.random() * users.length)];

    let reportedContent;
    let reportedUser;
    const reasonIndex = Math.floor(Math.random() * 4);
    const typeIndex = Math.floor(Math.random() * 3);

    if (typeIndex == 0) {
      reportedContent = users[Math.floor(Math.random() * users.length)];
      reportedUser = reportedContent._id;
    } else if (typeIndex == 1) {
      reportedContent = comments[Math.floor(Math.random() * comments.length)];
      reportedUser = reportedContent.author;
    } else {
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
    }

    await createReport(reportInfo);
  }

  return Response.json("success", { status: 200 })
}