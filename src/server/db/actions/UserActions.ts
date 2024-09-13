'use server'

import { editUserSchema, ExtendId } from "@/utils/types";
import UserModel, { User } from "../models/UserModel";
import dbConnect from "../dbConnect";

export async function getUser(id: string): Promise<ExtendId<User>> {
  await dbConnect();

  const user = await UserModel.findById(id);
  return user;
}

export async function updateUser(id: string, updated: Partial<User>): Promise<void> {
  await dbConnect();

  const parsedData = editUserSchema.parse(updated);
  await UserModel.findByIdAndUpdate(id, parsedData);
}