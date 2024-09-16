'use server'

import { Disability, DisabilityInput, disabilitySchema, editDisabilitySchema } from "@/utils/types/disability";
import dbConnect from "../dbConnect";
import DisabilityModel from "../models/DisabilityModel";
import mongoose from "mongoose";

/**
 * Creates a new disability record in the database.
 * @param disability - The disability input data.
 * @throws Will throw an error if the disability creation fails.
 * @returns The created disability object.
 */
export async function createDisability(disability: DisabilityInput): Promise<Disability> {
  try {
    await dbConnect();
    const parsedData = disabilitySchema.parse(disability);
    const createdDisability = await DisabilityModel.create(parsedData);
    return createdDisability.toObject();
  } catch (error) {
    console.error("Failed to create disability:", error);
    throw new Error("Failed to create disability");
  }
}

/**
 * Retrieves all disability records from the database.
 * @returns A promise that resolves to an array of disability objects.
 * @throws Will throw an error if the database connection fails.
 */
export async function getDisabilities(): Promise<Disability[]> {
  try {
    await dbConnect();
    const disabilities = await DisabilityModel.find();
    return disabilities;
  } catch (error) {
    console.error("Failed to retrieve disabilities:", error);
    throw new Error("Failed to retrieve disabilities");
  }
}

/**
 * Updates an existing disability record in the database.
 * @param id - The ID of the disability to update.
 * @param updated - The partial disability input data for updating.
 * @throws Will throw an error if the disability update fails or if the disability is not found.
 * @returns The updated disability object.
 */
export async function editDisability(id: string, updated: Partial<DisabilityInput>): Promise<Disability> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid disability ID");
  }

  try {
    await dbConnect();
    const parsedData = editDisabilitySchema.parse(updated);
    const updatedDisability = await DisabilityModel.findByIdAndUpdate(id, parsedData, { new: true });
    if (!updatedDisability) {
      throw new Error("Disability not found");
    }
    return updatedDisability.toObject();
  } catch (error) {
    console.error(`Failed to update disability ${id}:`, error);
    throw new Error(`Failed to update disability ${id}`);
  }
}