import { editReportSchema, ExtendId, reportSchema } from "@/utils/types";
import dbConnect from "../dbConnect";
import ReportModel from "../models/ReportModel";

export async function getReports(): Promise<ExtendId<Report>[]> {
  await dbConnect();

  const reports = ReportModel.find();
  return reports;
}

export async function getReportsByReportedUser(userId: string): Promise<ExtendId<Report>[]> {
  await dbConnect();

  const reports = ReportModel.find({ reportedUser: userId });
  return reports;
}

export async function createReport(report: Report): Promise<void> {
  await dbConnect();

  const parsedData = reportSchema.parse(report);
  await ReportModel.create(parsedData);
}

export async function editReport(id: string, report: Partial<Report>): Promise<void> {
  await dbConnect();

  const parsedData = editReportSchema.parse(report);
  await ReportModel.findByIdAndUpdate(id, parsedData);
}