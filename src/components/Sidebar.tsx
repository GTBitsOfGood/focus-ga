"use client";

import { usePathname, useRouter } from "next/navigation";
import { CornerUpLeft } from "lucide-react";
import { Bookmark } from "lucide-react";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { User } from "@/utils/types/user";

type SidebarButtonProps = {
  children: React.ReactNode;
  path: string;
  user?: User;
};

interface SidebarProps {
  user: User;
}

function SidebarButton({ children, path, user }: SidebarButtonProps) {
  const pathName = usePathname();
  const router = useRouter();

  const active = pathName === path;
  return (
    <button
      className={cn("w-full text-left hover:bg-gray-100 py-6 px-8 transition-colors flex gap-2 flex-row items-center", { "bg-gray-100 border-r-4 border-theme-blue": active })}
      onClick={() => router.push(path)}
    >
      {children}
    </button>
  )
}

export default function Sidebar({ user }: SidebarProps) {
  return (
    <div className="fixed top-[100px] left-0 w-[280px] border-r border-gray-300 pt-2 flex flex-col justify-between h-[calc(100vh-100px)] bg-white">
      <ul className="text-theme-gray text-lg space-y-1">
        <li>
          <SidebarButton path="/">
            <Home className="w-8 h-8" /> Home Page
          </SidebarButton>
        </li>
        <li>
          <SidebarButton path={`/family/${user._id}`}>
            <Bookmark className="w-8 h-8" /> Saved Posts
          </SidebarButton>
        </li>
        <li>
          <SidebarButton path="https://focus-ga.my.site.com/s/">
            <CornerUpLeft className="w-8 h-8" /> Family Portal
          </SidebarButton>
        </li>
      </ul>
      <a
        href="https://focus-ga.org/contact-us/"
        className="m-10 text-lg text-theme-blue font-bold hover:underline"
      >
        Contact FOCUS
      </a>
    </div>
  );
}
