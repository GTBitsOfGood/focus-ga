"use client";

import { getDateDifferenceString } from "@/utils/dateUtils";
import { cn } from "@/lib/utils";
import { ProfileColors } from "@/utils/consts";
import { PopulatedReport } from "@/utils/types/report";

type ReportComponentProps = {
  report: PopulatedReport;
  className?: string;
  isLast: boolean;
};

export default function ReportComponent({
  report,
  isLast,
}: ReportComponentProps) {
  const sourceUser = report.sourceUser;

  return (
    <div className="flex flex-col gap-3.5 rounded-lg text-theme-gray">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full",
              `bg-${sourceUser?.profileColor || ProfileColors.ProfileDefault}`,
            )}
          >
            <span className="select-none text-sm font-bold text-black">
              {sourceUser?.lastName.charAt(0).toUpperCase() || "D"}
            </span>
          </div>
          {sourceUser ? `${sourceUser.lastName} Family` : "Deleted User"}
        </div>
        <p suppressHydrationWarning>
          {getDateDifferenceString(new Date(), report.date)}
        </p>
      </div>
      <div>
        <h2 className="text-base font-medium text-black">Reason</h2>
        <p className="text-sm font-normal">{report.reason}</p>
      </div>
      {report.description && (
        <div>
          <h2 className="text-base font-medium text-black">Description</h2>
          <p className="text-sm font-normal">{report.description}</p>
        </div>
      )}
      {!isLast && (
        <div className="mb-5 h-[1px] w-full bg-theme-medlight-gray" />
      )}
    </div>
  );
}
