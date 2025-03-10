"use server";

import {
  reportSchema,
  editReportSchema,
  Report,
  ReportInput,
  PopulatedReport,
} from "@/utils/types/report";
import dbConnect from "../dbConnect";
import ReportModel from "../models/ReportModel";
import mongoose from "mongoose";
import UserModel from "../models/UserModel";
import { getAuthenticatedUser } from "./AuthActions";

/**
 * Retrieves all reports from the database, sorted by date in descending order.
 * @returns A promise that resolves to an array of report objects.
 * @throws Will throw an error if the database connection fails.
 */
export async function getReports(): Promise<Report[]> {
  try {
    await dbConnect();
    const reports = await ReportModel.find().sort({ date: "desc" });
    return reports;
  } catch (error) {
    console.error("Failed to retrieve reports:", error);
    throw new Error("Failed to retrieve reports");
  }
}

/**
 * Returns if there are any unresolved reports
 * @returns True if there are unresolved reports, otherwise false
 * @throws Will throw an error if the database connection fails.
 */
export async function hasUnresolvedReports(): Promise<boolean> {
  try {
    await dbConnect();
    const count = await ReportModel.countDocuments({ isResolved: "false" });
    return count > 0;
  } catch (error) {
    console.error("Failed to retrieve reports:", error);
    throw new Error("Failed to retrieve reports");
  }
}

/**
 * Fetches a list of reports associated with a specific content ID.
 * @param contentId The unique identifier of the content for which reports are being retrieved.
 * @returns A promise that resolves to an array of reports associated with the provided content ID.
 */
export async function getReportsByContentId(
  contentId: string,
): Promise<PopulatedReport[]> {
  if (!mongoose.Types.ObjectId.isValid(contentId)) {
    throw new Error("Invalid contentId");
  }

  try {
    await dbConnect();
    const reports = await ReportModel.find({ reportedContent: contentId })
      .populate({ path: "sourceUser", model: UserModel })
      .sort({ date: "desc" });
    return reports.map((report) => report.toObject());
  } catch (error) {
    console.error(
      `Failed to retrieve reports for contentId ${contentId}:`,
      error,
    );
    throw new Error(`Failed to retrieve reports for contentId ${contentId}`);
  }
}

/**
 * Retrieves all reports for a specific user from the database, sorted by date in descending order.
 * @param userId - The ID of the reported user.
 * @returns A promise that resolves to an array of report objects.
 * @throws Will throw an error if the userId is invalid or if the database connection fails.
 */
export async function getReportsByReportedUser(
  userId: string,
): Promise<Report[]> {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  try {
    await dbConnect();
    const reports = await ReportModel.find({ reportedUser: userId }).sort({
      date: "desc",
    });
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
export async function editReport(
  id: string,
  report: Partial<ReportInput>,
): Promise<Report> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid report ID");
  }

  try {
    await dbConnect();
    const parsedData = editReportSchema.parse(report);
    const currentUser = await getAuthenticatedUser();
    if (parsedData.isResolved && !currentUser?.isAdmin) {
      throw new Error("Only admins can resolve reports");
    }

    const updatedReport = await ReportModel.findByIdAndUpdate(id, parsedData, {
      new: true,
    });
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

/**
 * Updates reports for a content piece (post or comment) to be resolved
 * @param id - The ID of the content to update
 * @throws Will throw an error if the report update fails or if the input data is invalid
 */
export async function updateAllReportedContentResolved(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid report ID");
  }

  try {
    await dbConnect();
    const reportsForContent = await getReportsByContentId(id);

    //this checks for content that do not have any reports, so that this function can still be called on them
    if (reportsForContent.length > 0) {
      reportsForContent.map(async (report) => {
        const updatedReport: PopulatedReport = { ...report, isResolved: true };
        await ReportModel.findByIdAndUpdate(report._id, updatedReport);
      });
    }
  } catch (e) {
    console.error(`Failed to update all reported content ${id}:`, e);
    throw new Error(`Failed to update all reported content ${id}`);
  }
}
