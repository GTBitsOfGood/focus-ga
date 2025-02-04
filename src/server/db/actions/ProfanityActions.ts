'use server';

import dbConnect from "../dbConnect";
import ProfanityModel, { Profanity } from "../models/ProfanityModel";
import { ProfanityInput } from "@/utils/types/profanity";

export async function getAllProfanities(): Promise<Profanity[]> {
  await dbConnect();
  let profanities = await ProfanityModel.find({}).sort({ name: 1 });
  return profanities.map(profanity => profanity.toObject());;
}

export async function addProfanity(profanity: ProfanityInput): Promise<Profanity> {
  await dbConnect();
  let createdProfanity = await ProfanityModel.create(profanity)
  return createdProfanity.toObject();
}

export async function deleteProfanity(id: string): Promise<Profanity | null> {
  await dbConnect();
  let deletedDisability = await ProfanityModel.findByIdAndDelete(id);
  return deletedDisability.toObject();
}