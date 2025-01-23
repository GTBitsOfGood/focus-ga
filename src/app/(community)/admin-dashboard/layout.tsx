"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { ChevronLeftIcon } from "lucide-react";

const tabs = [
  { name: "Admin Privileges", path: "admin-privileges" },
  { name: "Banned Users", path: "banned-users" },
  { name: "Reported Posts", path: "reported-posts" },
  { name: "Disabilities List", path: "disabilities-list" },
  { name: "Content Flagging", path: "content-flagging" },
];

// Try not to change this file or it may cause merge conflicts
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col md:flex-row h-full">
      <aside className="w-full md:w-1/6 p-4">
        <Link
          href="/"
          className="flex items-center gap-1 w-min text-lg p-2 cursor-pointer ml-0 md:ml-16 lg:ml-32"
        >
          <ChevronLeftIcon className="w-6 h-6" /> Back
        </Link>
        <nav className="mt-4 md:mt-24 space-y-1 ml-0 md:ml-4 flex flex-col items-start">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              href={`/admin-dashboard/${tab.path}`}
              className={`px-4 rounded-lg text-[14px] transform transition-transform duration-200 ${
                pathname === `/admin-dashboard/${tab.path}`
                  ? "text-theme-blue scale-[1.05]"
                  : "text-theme-gray"
              } hover:scale-[1.08] hover:text-theme-blue`}
              style={{
                marginTop: "2vh",
                marginLeft: "3vw",
              }}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-8 mr-20">{children}</main>
    </div>
  );
}
