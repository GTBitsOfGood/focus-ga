'use server'

import { reportSchema, editReportSchema, Report, ReportInput } from "@/utils/types/report";
import dbConnect from "../dbConnect";
import ReportModel from "../models/ReportModel";
import mongoose from "mongoose";

/**
 * Retrieves all reports from the database, sorted by date in descending order.
 * @returns A promise that resolves to an array of report objects.
 * @throws Will throw an error if the database connection fails.
 */
export async function getReports(): Promise<Report[]> {
  try {
    await dbConnect();
    const reports = await ReportModel.find().sort({ date: 'desc' });
    return reports;
  } catch (error) {
    console.error("Failed to retrieve reports:", error);
    throw new Error("Failed to retrieve reports");
  }
}

export async function getReportsByPost(postId: string): Promise<Report[]> {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new Error("Invalid postId");
  }

  try {
    await dbConnect();
    const reports = await ReportModel.find({ reportedContent: postId, contentType: "Post" }).sort({ date: 'desc' });
    return reports;
  } catch (error) {
    console.error(`Failed to retrieve reports for user ${postId}:`, error);
    throw new Error(`Failed to retrieve reports for user ${postId}`);
  }
}

/**
 * Retrieves all reports for a specific user from the database, sorted by date in descending order.
 * @param userId - The ID of the reported user.
 * @returns A promise that resolves to an array of report objects.
 * @throws Will throw an error if the userId is invalid or if the database connection fails.
 */
export async function getReportsByReportedUser(userId: string): Promise<Report[]> {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  try {
    await dbConnect();
    const reports = await ReportModel.find({ reportedUser: userId }).sort({ date: 'desc' });
    return reports;
  } catch (error) {
    console.error(`Failed to retrieve reports for user ${userId}:`, error);
    throw new Error(`Failed to retrieve reports for user ${userId}`);
  }
}

/**
 * Creates a new report in the database.
 * @param report - The report input data.
 * @throws Will throw an error if the report creation fails or if the input data is invalid.
 * @returns The created report object.
 */
export async function createReport(report: ReportInput): Promise<Report> {
  try {
    await dbConnect();
    const parsedData = reportSchema.parse(report);
    const createdReport = await ReportModel.create(parsedData);
    return createdReport.toObject();
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to create report:", error.message);
      throw new Error(`Failed to create report: ${error.message}`);
    } else {
      console.error("Failed to create report:", error);
      throw new Error("Failed to create report");
    }
  }
}

/**
 * Updates an existing report in the database.
 * @param id - The ID of the report to update.
 * @param report - The partial report input data for updating.
 * @throws Will throw an error if the report update fails, if the input data is invalid, or if the report is not found.
 * @returns The updated report object.
 */
export async function editReport(id: string, report: Partial<ReportInput>): Promise<Report> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid report ID");
  }

  try {
    await dbConnect();
    const parsedData = editReportSchema.parse(report);
    const updatedReport = await ReportModel.findByIdAndUpdate(id, parsedData, { new: true });
    if (!updatedReport) {
      throw new Error("Report not found");
    }
    return updatedReport.toObject();
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Failed to update report ${id}:`, error.message);
      throw new Error(`Failed to update report ${id}: ${error.message}`);
    } else {
      console.error(`Failed to update report ${id}:`, error);
      throw new Error(`Failed to update report ${id}`);
    }
  }
}