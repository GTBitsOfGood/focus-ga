"use server";

import {
  reportSchema,
  editReportSchema,
  Report,
  ReportInput,
  PopulatedReport,
  ReportReason,
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
    const currentUser = await getAuthenticatedUser();
    if (!currentUser || !currentUser.isAdmin) {
      throw new Error("User does not have access");
    }
    const reports = await ReportModel.find().sort({ date: "desc" });
    return reports;
  } catch (error) {
    console.error("Failed to retrieve reports:", error);
    throw new Error("Failed to retrieve reports");
  }
}

/**
 * Retrieves all reports from the database except those with reason LANGUAGE, sorted by date in descending order.
 * @returns A promise that resolves to an array of report objects.
 * @throws Will throw an error if the database connection fails.
 */
export async function getReportsExcludingLanguage(): Promise<Report[]> {
  try {
    await dbConnect();
    const currentUser = await getAuthenticatedUser();
    if (!currentUser || !currentUser.isAdmin) {
      throw new Error("User does not have access");
    }
    const reports = await ReportModel.find({
      reason: { $ne: ReportReason.LANGUAGE }
    }).sort({ date: "desc" });
    return reports;
  } catch (error) {
    console.error("Failed to retrieve reports:", error);
    throw new Error("Failed to retrieve reports");
  }
}

/**
 * Returns if there are any unresolved reports, excluding reports with reason LANGUAGE
 * @returns True if there are unresolved reports (excluding LANGUAGE reports), otherwise false
 * @throws Will throw an error if the database connection fails.
 */
export async function hasUnresolvedReports(): Promise<boolean> {
  try {
    await dbConnect();
    const currentUser = await getAuthenticatedUser();
    if (!currentUser || !currentUser.isAdmin) {
      throw new Error("User does not have access");
    }
    const count = await ReportModel.countDocuments({
      isResolved: false,
      contentType: { $in: ["Post", "Comment"] },
      reason: { $ne: ReportReason.LANGUAGE }
    });
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

  await dbConnect();

  const currentUser = await getAuthenticatedUser();
  if (!currentUser) {
    throw new Error("User does not have access");
  }

  try {
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

  await dbConnect();
  const currentUser = await getAuthenticatedUser();
  if (!currentUser || !currentUser.isAdmin) {
    throw new Error("User does not have access");
  }

  try {
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
  await dbConnect();
  const currentUser = await getAuthenticatedUser();
  if (!currentUser) {
    throw new Error("User does not have access");
  }

  try {
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

  await dbConnect();
  const currentUser = await getAuthenticatedUser();
  if (!currentUser || !currentUser.isAdmin) {
    throw new Error("User does not have access");
  }

  try {
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

  await dbConnect();
  const currentUser = await getAuthenticatedUser();
  if (!currentUser) {
    throw new Error("User does not have access");
  }

  try {
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

/**
 * Retrieves the IDs of content (posts/comments) that have unresolved reports with LANGUAGE reason.
 * @param contentType - The type of content to get reports for (Post or Comment).
 * @returns A promise that resolves to an array of objects containing content IDs and report dates.
 * @throws Will throw an error if the database connection fails.
 */
export async function getLanguageReportedContentIds(contentType: string): Promise<{ id: mongoose.Types.ObjectId; date: Date }[]> {
  try {
    await dbConnect();
    const currentUser = await getAuthenticatedUser();
    if (!currentUser || !currentUser.isAdmin) {
      throw new Error("User does not have access");
    }
    
    const reports = await ReportModel.find({
      reason: ReportReason.LANGUAGE,
      isResolved: false,
      contentType: contentType
    }).sort({ date: "desc" });
    
    // Extract unique content IDs with their dates
    const contentMap = new Map<string, Date>();
    reports.forEach(report => {
      const idStr = report.reportedContent.toString();
      if (!contentMap.has(idStr) || new Date(contentMap.get(idStr)!) < new Date(report.date)) {
        contentMap.set(idStr, report.date);
      }
    });
    
    // Convert back to array of objects
    return Array.from(contentMap).map(([idStr, date]) => ({
      id: new mongoose.Types.ObjectId(idStr),
      date
    }));
  } catch (error) {
    console.error("Failed to retrieve language reported content IDs:", error);
    throw new Error("Failed to retrieve language reported content IDs");
  }
}
