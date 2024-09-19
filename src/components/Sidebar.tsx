"use client";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();

  return (
    <div className="fixed top-[100px] left-0 h-full w-[237px] border-r border-gray-300 pt-2">
      <ul className="text-[#636363] text-xl">
        <li>
          <button
            className="w-full text-left text-blue-600 hover:bg-gray-100 py-6 px-8 transition-colors"
            onClick={() => router.push("/main")}
          >
            Home Page
          </button>
        </li>
        <li>
          <button
            className="w-full text-left text-blue-600 hover:bg-gray-100 py-6 px-8 transition-colors"
            onClick={() => router.push("/saved-posts")}
          >
            Saved Posts
          </button>
        </li>
        <li>
          <button
            className="w-full text-left text-blue-600 hover:bg-gray-100 py-6 px-8 transition-colors"
            onClick={() => (window.location.href = "https://focus-ga.my.site.com/s/")}
          >
            Family Portal
          </button>
        </li>
      </ul>
    </div>
  );
}
