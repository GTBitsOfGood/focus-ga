"use server";

import dbConnect from "../dbConnect";
import ProfanityModel, { Profanity } from "../models/ProfanityModel";
import { ProfanityInput } from "@/utils/types/profanity";
import { getAuthenticatedUser } from "./AuthActions";

export async function getAllProfanities(): Promise<Profanity[]> {
  await dbConnect();
  let profanities = await ProfanityModel.find({}).sort({ name: 1 });
  return profanities.map((profanity) => profanity.toObject());
}

export async function addProfanity(
  profanity: ProfanityInput,
): Promise<Profanity> {
  await dbConnect();
  const currentUser = await getAuthenticatedUser();
  if (!currentUser?.isAdmin) {
    throw new Error("Only admins can add profanities");
  }
  let trimmed: ProfanityInput = {
    name: profanity.name.trim(),
  };
  let createdProfanity = await ProfanityModel.create(trimmed);
  return createdProfanity.toObject();
}

export async function deleteProfanity(id: string): Promise<Profanity | null> {
  await dbConnect();
  const currentUser = await getAuthenticatedUser();
  if (!currentUser?.isAdmin) {
    throw new Error("Only admins can delete profanities");
  }
  let deletedDisability = await ProfanityModel.findByIdAndDelete(id);
  return deletedDisability.toObject();
}
