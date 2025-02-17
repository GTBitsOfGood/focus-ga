"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React from "react";
import { ChevronLeftIcon } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { hasUnresolvedReports } from "@/server/db/actions/ReportActions";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user: currUser, setUser } = useUser();
  const [hasUnresolvedReport, setHasUnresolvedReport] = useState(false);

  useEffect(() => {
    if (!currUser?.isAdmin) {
      router.replace("/");
    }
  }, [currUser, router]);

  useEffect(() => {
    const fetchReports = async () => {
      const bool = await hasUnresolvedReports();
      setHasUnresolvedReport(bool);
    };
    fetchReports();
  }, []);

  if (!currUser?.isAdmin) return null;
  
  return (
    <div className="flex flex-col md:flex-row h-full">
      <aside className="w-full md:w-1/6 p-4">
        <Link
          href="/"
          className="flex items-center gap-1 w-min text-lg p-2 cursor-pointer ml-0 md:ml-16 lg:ml-32 text-theme-gray"
        >
          <ChevronLeftIcon className="w-6 h-6" /> Back
        </Link>
        <nav className="mt-4 md:mt-24 space-y-1 ml-0 md:ml-4 flex flex-col items-start">
          <Link
            href="/admin-dashboard/admin-privileges"
            className={`px-4 rounded-lg text-[14px] transform transition-transform duration-200 ${
              pathname === "/admin-dashboard/admin-privileges"
                ? "text-theme-blue scale-[1.05]"
                : "text-theme-gray"
            } hover:scale-[1.08] hover:text-theme-blue`}
            style={{ marginTop: "2vh", marginLeft: "3vw" }}
          >
            Admin Privileges
          </Link>

          <Link
            href="/admin-dashboard/banned-users"
            className={`px-4 rounded-lg text-[14px] transform transition-transform duration-200 ${
              pathname === "/admin-dashboard/banned-users"
                ? "text-theme-blue scale-[1.05]"
                : "text-theme-gray"
            } hover:scale-[1.08] hover:text-theme-blue`}
            style={{ marginTop: "2vh", marginLeft: "3vw" }}
          >
            Banned Users
          </Link>

          <Link
            href="/admin-dashboard/reported-posts"
            className={`flex items-center gap-2 px-4 rounded-lg text-[14px] transform transition-transform duration-200 ${
              pathname === "/admin-dashboard/reported-posts"
                ? "text-theme-blue scale-[1.05]"
                : "text-theme-gray"
            } hover:scale-[1.08] hover:text-theme-blue`}
            style={{ marginTop: "2vh", marginLeft: "3vw" }}
          >
            Reported Posts
            {hasUnresolvedReport && (
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </Link>

          <Link
            href="/admin-dashboard/disabilities-list"
            className={`px-4 rounded-lg text-[14px] transform transition-transform duration-200 ${
              pathname === "/admin-dashboard/disabilities-list"
                ? "text-theme-blue scale-[1.05]"
                : "text-theme-gray"
            } hover:scale-[1.08] hover:text-theme-blue`}
            style={{ marginTop: "2vh", marginLeft: "3vw" }}
          >
            Disabilities List
          </Link>

          <Link
            href="/admin-dashboard/content-flagging"
            className={`px-4 rounded-lg text-[14px] transform transition-transform duration-200 ${
              pathname === "/admin-dashboard/content-flagging"
                ? "text-theme-blue scale-[1.05]"
                : "text-theme-gray"
            } hover:scale-[1.08] hover:text-theme-blue`}
            style={{ marginTop: "2vh", marginLeft: "3vw" }}
          >
            Content Flagging
          </Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-8 mr-20">{children}</main>
    </div>
  );
}
