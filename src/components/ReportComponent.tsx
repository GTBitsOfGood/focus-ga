'use client'

import { useEffect, useState } from "react";
import { getDateDifferenceString } from "@/utils/dateUtils";
import { cn } from "@/lib/utils";
import { ProfileColors } from "@/utils/consts";
import { Report } from "@/utils/types/report";
import { getUser } from "@/server/db/actions/UserActions";
import { User } from "@/utils/types/user";

type ReportComponentProps = {
  report: Report;
  className?: string;
  isLast: boolean
};

export default function ReportComponent({ report, isLast } : ReportComponentProps) {
  const [sourceUser, setSourceUser] = useState<User>()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getUser(report.sourceUser.toString());
        setSourceUser(user);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    if (report.sourceUser) {
      fetchUser();
    }
  }, [report.sourceUser]);

  return (
    <div className="flex flex-col gap-3.5 text-theme-gray rounded-lg">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className={cn("w-6 h-6 rounded-full inline-block", {[`bg-${sourceUser?.profileColor ? sourceUser.profileColor : ProfileColors.ProfileDefault}`]: true})}/>
          {sourceUser ? `${sourceUser.lastName} Family` : 'Deleted User'}
        </div>
        <p suppressHydrationWarning>{getDateDifferenceString(new Date(), report.date)}</p>
      </div>
      <div>
        <h2 className="text-base text-black font-medium">Reason</h2>
        <p className="text-sm font-normal">{report.reason}</p>
      </div>
      {
        report.description ? (
          <div>
            <h2 className="text-base text-black font-medium">Description</h2>
            <p className="text-sm font-normal">{report.description}</p>
          </div>
        ) : null
      }
      { 
        !isLast ? (
          <div className="w-full h-[1px] bg-theme-medlight-gray mb-5"/>
        ) : null
      }
    </div>
  );
}