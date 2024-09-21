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
import { createPost } from '@/server/db/actions/PostActions';

const disabilities = ["Cerebral Palsy", "Autism Spectrum Disorder", "Down Syndrome", "Spina Bifida", "Muscular Dystrophy", "Rett Syndrome", "Fragile X Syndrome", "Epilepsy", "ADHD", "Spinal Muscular Atrophy"];

export async function POST(request: Request) {
  await dbConnect();

  // clear the database
  CommentLikeModel.deleteMany({});
  CommentModel.deleteMany({});
  DisabilityModel.deleteMany({});
  PostLikeModel.deleteMany({});
  PostModel.deleteMany({});
  PostSaveModel.deleteMany({});
  ReportModel.deleteMany({});
  UserModel.deleteMany({});

  // create disabilities
  const disabilityIds = []
  for (const disability in disabilities) {
    const id = (await createDisability({ name: disability }))._id;
    disabilityIds.push(id);
  }


  // create users
  const users = [];
  const userIds = [];
  for (let i = 0; i < 10; i++) {
    const randomDisabilityCount = Math.floor(Math.random() * 10) + 1;
    const availableDisabilities = [...disabilityIds];
    const selectedDisabilities: string[] = [];

    for (let i = 0; i < randomDisabilityCount; i++) {
      const randomIndex = Math.floor(Math.random() * availableDisabilities.length);
      selectedDisabilities.push(disabilityIds[randomIndex]);
      availableDisabilities.splice(randomIndex, 1); // Remove selected number to avoid duplicates
    }

    const userInfo = {
      username: faker.internet.userName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      childAge: Math.floor(Math.random() * (20)) + 1, // generates random age between 1 and 20
      childDisabilities: selectedDisabilities,
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
      }
    }

    users.push(userInfo);
    const id = (await createUser(userInfo))._id;
    userIds.push(id);
  }


  // create posts
  const posts = [];
  const postIds = [];
  for (const userId in userIds) {
    const numberOfPosts = Math.floor(Math.random() * (16)) + 10;

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
        title: faker.lorem.words({ min: 3, max: 14 }),
        content: faker.lorem.paragraph({ min: 3, max: 10 }),
        tags: selectedDisabilities,
      }

      posts.push(postInfo);
      const id = ((await createPost(postInfo))._id);
      postIds.push(id);
    }
  }

  return Response.json("success", { status: 200 })
}