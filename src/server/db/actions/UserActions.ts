'use server'

import { editUserSchema, ExtendId } from "@/utils/types";
import UserModel, { User, UserInput } from "../models/UserModel";
import dbConnect from "../dbConnect";

export async function getUser(id: string): Promise<ExtendId<User>> {
  await dbConnect();

  const user = await UserModel.findById(id);
  return user.toObject();
}

export async function updateUser(id: string, updated: Partial<UserInput>): Promise<void> {
  await dbConnect();

  const parsedData = editUserSchema.parse(updated);
  await UserModel.findByIdAndUpdate(id, parsedData);
}