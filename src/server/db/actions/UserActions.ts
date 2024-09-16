'use server'

import { editUserSchema, User, UserInput } from "@/utils/types/user";
import UserModel from "../models/UserModel";
import dbConnect from "../dbConnect";
import { ExtendId } from "@/utils/types/common";

export async function getUser(id: string): Promise<ExtendId<User>> {
  await dbConnect();

  const user = await UserModel.findById(id);
  return user.toObject();
}

export async function editUser(id: string, updated: Partial<UserInput>): Promise<void> {
  await dbConnect();

  const parsedData = editUserSchema.parse(updated);
  await UserModel.findByIdAndUpdate(id, parsedData);
}