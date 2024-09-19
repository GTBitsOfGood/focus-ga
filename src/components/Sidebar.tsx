"use client";
import { useRouter } from "next/navigation";
import { CornerUpLeft } from "lucide-react";
import { Bookmark } from "lucide-react";
import { Home } from "lucide-react";
import { useEffect, useState } from "react";


export default function Sidebar() {
  
  const [urlRoute, setUrlRoute] = useState("");
  const router = useRouter();
  const sidebarButtonStyling = "w-full text-left text-blue-600 hover:bg-gray-100 py-6 px-8 transition-colors flex gap-2 flex-row items-center "

  useEffect(() => {
    setUrlRoute(window.location.href.split("/")[window.location.href.split("/").length - 1])
  }, [])
  return (
    <div className="fixed top-[100px] left-0 w-[280px] border-r border-gray-300 pt-2 flex flex-col justify-between" style={{ height: 'calc(100vh - 100px)' }}>
      <ul className="text-[#636363] text-xl">
        <li>
          <button
            className={sidebarButtonStyling + (urlRoute === "main" ? "bg-gray-100 border-r-4 border-blue" : "")}
            onClick={() => router.push("/main")}
          >
            <Home className="w-8 h-8" /> Home Page
          </button>
        </li>
        <li>
          <button
            className={sidebarButtonStyling + (urlRoute === "saved-posts" ? "bg-gray-100" : "")} // change to the actual route name we decide to use for saved posts
            onClick={() => router.push("/saved-posts")}
          >
            <Bookmark className="w-8 h-8" /> Saved Posts
          </button>
        </li>
        <li>
          <button
            className={sidebarButtonStyling}
            onClick={() => (window.location.href = "https://focus-ga.my.site.com/s/")}
          >
            <CornerUpLeft className="w-8 h-8" /> Family Portal
          </button>
        </li>
      </ul>
      <a
        href="https://focus-ga.org/contact-us/"
        className="m-10 text-lg text-blue font-bold"
      >
        Contact FOCUS
      </a>
    </div>
  );
}
