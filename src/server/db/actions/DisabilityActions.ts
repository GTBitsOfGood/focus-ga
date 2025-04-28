"use server";

import {
  Disability,
  DisabilityInput,
  disabilitySchema,
  editDisabilitySchema,
} from "@/utils/types/disability";
import dbConnect from "../dbConnect";
import DisabilityModel from "../models/DisabilityModel";
import mongoose from "mongoose";
import { getAuthenticatedUser } from "./AuthActions";

/**
 * Creates a new disability record in the database.
 * @param disability - The disability input data.
 * @throws Will throw an error if the disability creation fails.
 * @returns The created disability object.
 */
export async function createDisability(
  disability: DisabilityInput,
): Promise<Disability> {
  try {
    await dbConnect();
    const currentUser = await getAuthenticatedUser();
    const parsedData = disabilitySchema.parse(disability);
    const createdDisability = await DisabilityModel.create(parsedData);
    return createdDisability.toObject();
  } catch (error) {
    console.error("Failed to create diagnosis:", error);
    throw new Error("Failed to create diagnosis");
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
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      throw new Error("User does not have access");
    }
    const disabilities = await DisabilityModel.find();
    return disabilities.map((disability) => disability.toObject());
  } catch (error) {
    console.error("Failed to retrieve disabilities:", error);
    throw new Error("Failed to retrieve disabilities");
  }
}

/**
 * Retrieves a disability object with the inputted id.
 * @param id The id of the disability to return.
 * @returns A promist that resolves to a disbility object.
 * @throws  Will throw an error if the database connection fails or disability is not found.
 */
export async function getDisability(id: String): Promise<Disability> {
  try {
    await dbConnect();
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      throw new Error("User does not have access");
    }
    const disability = await DisabilityModel.findById(id);
    return disability.toObject();
  } catch (error) {
    console.error("Failed to retrieve diagnosis: ", error);
    throw new Error("Failed to retrieve diagnosis");
  }
}

/**
 * Updates an existing disability record in the database.
 * @param id - The ID of the disability to update.
 * @param updated - The partial disability input data for updating.
 * @throws Will throw an error if the disability update fails or if the disability is not found.
 * @returns The updated disability object.
 */
export async function editDisability(
  id: string,
  updated: Partial<DisabilityInput>,
): Promise<Disability> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid disability ID");
  }

  try {
    await dbConnect();
    const currentUser = await getAuthenticatedUser();
    if (!currentUser?.isAdmin) {
      throw new Error("Only admins can edit disabilities");
    }
    const parsedData = editDisabilitySchema.parse(updated);
    const updatedDisability = await DisabilityModel.findByIdAndUpdate(
      id,
      parsedData,
      { new: true },
    );
    if (!updatedDisability) {
      throw new Error("Disability not found");
    }
    return updatedDisability.toObject();
  } catch (error) {
    console.error(`Failed to update diagnosis ${id}:`, error);
    throw new Error(`Failed to update diagnosis ${id}`);
  }
}

/**
 * Deletes a disability record from the database.
 * @param id - The ID of the disability to delete.
 * @throws Will throw an error if the deletion fails or if the disability is not found.
 * @returns The deleted disability object.
 */
export async function deleteDisability(id: string): Promise<Disability> {
  console.log("Received ID:", id);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid diagnosis ID");
  }

  try {
    await dbConnect();
    const currentUser = await getAuthenticatedUser();
    if (!currentUser?.isAdmin) {
      throw new Error("Only admins can delete diagnoses");
    }
    const deletedDisability = await DisabilityModel.findByIdAndDelete(id);
    if (!deletedDisability) {
      throw new Error("Diagnosis not found");
    }
    return deletedDisability.toObject();
  } catch (error) {
    console.error(`Failed to delete diagnosis ${id}:`, error);
    throw new Error(`Failed to delete diagnosis ${id}`);
  }
}
