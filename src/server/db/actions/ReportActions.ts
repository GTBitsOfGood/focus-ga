'use server'

import { editReportSchema, ExtendId, reportSchema } from "@/utils/types";
import dbConnect from "../dbConnect";
import ReportModel from "../models/ReportModel";
import { Report, ReportInput } from "@/utils/types";

export async function getReports(): Promise<ExtendId<Report>[]> {
  await dbConnect();

  const reports = await ReportModel.find().sort({ date: 'desc' });
  return reports;
}

export async function getReportsByReportedUser(userId: string): Promise<ExtendId<Report>[]> {
  await dbConnect();

  const reports = await ReportModel.find({ reportedUser: userId }).sort({ date: 'desc' });
  return reports;
}

export async function createReport(report: ReportInput): Promise<void> {
  await dbConnect();

  const parsedData = reportSchema.parse(report);
  await ReportModel.create(parsedData);
}

export async function editReport(id: string, report: Partial<ReportInput>): Promise<void> {
  await dbConnect();

  const parsedData = editReportSchema.parse(report);
  await ReportModel.findByIdAndUpdate(id, parsedData);
}