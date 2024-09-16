'use server'

import { Disability, DisabilityInput, disabilitySchema, editDisabilitySchema, ExtendId } from "@/utils/types";
import dbConnect from "../dbConnect";
import DisabilityModel from "../models/DisabilityModel";

export async function createDisability(disability: DisabilityInput): Promise<void> {
  await dbConnect();

  const parsedData = disabilitySchema.parse(disability);
  await DisabilityModel.create(parsedData);
}

export async function getDisabilities(): Promise<ExtendId<Disability>[]> {
  await dbConnect();

  const disabilities = await DisabilityModel.find();
  return disabilities;
}

export async function editDisability(id: string, updated: Partial<DisabilityInput>): Promise<void> {
  await dbConnect();

  const parsedData = editDisabilitySchema.parse(updated);
  await DisabilityModel.findByIdAndUpdate(id, parsedData);
}