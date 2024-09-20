import { faker } from '@faker-js/faker';
import type { NextApiRequest, NextApiResponse } from 'next';
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

const disabilities = ["Cerebral Palsy", "Autism Spectrum Disorder", "Down Syndrome", "Spina Bifida", "Muscular Dystrophy", "Rett Syndrome", "Fragile X Syndrome", "Epilepsy", "ADHD", "Spinal Muscular Atrophy"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
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
      disabilityIds.push(id.toString());
    }

    // create users
    const users = [];
    const userIds = [];
    for (let i = 0; i < 10; i++) {
      const userInfo = {
        username: faker.internet.userName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        childAge: Math.floor(Math.random() * (20)) + 1, // generates random age between 1 and 20
        childDisabilities: [],
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          zipCode: faker.location.zipCode(),
        }
      }
      // TODO: choose a random number of disabilities for each user
      users.push(userInfo);
      const id = (await createUser(userInfo))._id;
      userIds.push(id.toString());
    }

  } else {
    res.status(405).json({ error: "Invalid request method." })
  }
}