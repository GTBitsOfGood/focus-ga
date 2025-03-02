"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React from "react";
import { ChevronLeftIcon } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { hasUnresolvedReports } from "@/server/db/actions/ReportActions";
import { hasFlaggedPosts } from "@/server/db/actions/PostActions";
import { hasFlaggedComments } from "@/server/db/actions/CommentActions";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user: currUser, setUser } = useUser();
  const [hasUnresolvedReport, setHasUnresolvedReport] = useState(false);
  const [flaggedContent, setFlaggedContent] = useState(false);

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

    const fetchFlaggedContent = async () => {
      const posts = await hasFlaggedPosts();
      const comments = await hasFlaggedComments();
      setFlaggedContent(posts || comments);
    };

    fetchReports();
    fetchFlaggedContent();
  }, []);

  if (!currUser?.isAdmin) return null;

  return (
    <div className="flex h-full flex-col md:flex-row">
      <aside className="w-full p-4 md:w-1/6">
        <Link
          href="/"
          className="ml-0 flex w-min cursor-pointer items-center gap-1 p-2 text-lg text-theme-gray md:ml-16 lg:ml-32"
        >
          <ChevronLeftIcon className="h-6 w-6" /> Back
        </Link>
        <nav className="ml-0 mt-4 flex flex-col items-start space-y-1 md:ml-4 md:mt-24">
          <Link
            href="/admin-dashboard/admin-privileges"
            className={`transform rounded-lg px-4 text-[14px] transition-transform duration-200 ${
              pathname === "/admin-dashboard/admin-privileges"
                ? "scale-[1.05] text-theme-blue"
                : "text-theme-gray"
            } hover:scale-[1.08] hover:text-theme-blue`}
            style={{ marginTop: "2vh", marginLeft: "3vw" }}
          >
            Admin Privileges
          </Link>

          <Link
            href="/admin-dashboard/banned-users"
            className={`transform rounded-lg px-4 text-[14px] transition-transform duration-200 ${
              pathname === "/admin-dashboard/banned-users"
                ? "scale-[1.05] text-theme-blue"
                : "text-theme-gray"
            } hover:scale-[1.08] hover:text-theme-blue`}
            style={{ marginTop: "2vh", marginLeft: "3vw" }}
          >
            Banned Users
          </Link>

          <Link
            href="/admin-dashboard/reported-content"
            className={`flex transform items-center gap-2 rounded-lg px-4 text-[14px] transition-transform duration-200 ${
              pathname === "/admin-dashboard/reported-content"
                ? "scale-[1.05] text-theme-blue"
                : "text-theme-gray"
            } hover:scale-[1.08] hover:text-theme-blue`}
            style={{ marginTop: "2vh", marginLeft: "3vw" }}
          >
            Reported Content
            {hasUnresolvedReport && (
              <span className="w-2 h-2 aspect-square rounded-full bg-red-500"></span>
            )}
          </Link>

          <Link
            href="/admin-dashboard/disabilities-list"
            className={`transform rounded-lg px-4 text-[14px] transition-transform duration-200 ${
              pathname === "/admin-dashboard/disabilities-list"
                ? "scale-[1.05] text-theme-blue"
                : "text-theme-gray"
            } hover:scale-[1.08] hover:text-theme-blue`}
            style={{ marginTop: "2vh", marginLeft: "3vw" }}
          >
            Disabilities List
          </Link>

          <Link
            href="/admin-dashboard/content-flagging"
            className={`flex transform items-center gap-2 rounded-lg px-4 text-[14px] transition-transform duration-200 ${
              pathname === "/admin-dashboard/content-flagging"
                ? "scale-[1.05] text-theme-blue"
                : "text-theme-gray"
            } hover:scale-[1.08] hover:text-theme-blue`}
            style={{ marginTop: "2vh", marginLeft: "3vw" }}
          >
            Content Flagging
            {flaggedContent && (
              <span className="w-2 h-2 aspect-square rounded-full bg-red-500"></span>
            )}
          </Link>
        </nav>
      </aside>
      <main className="mr-20 flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
