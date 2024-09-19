"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import focusLogo from "@/../public/focus-logo.png";
import Image from "next/image";

export default function Navbar() {
  const router = useRouter();
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  const toggleDropdown = () => {
    setMenuIsOpen(!menuIsOpen);
  };

  return (
    <div className="w-full h-[100px] bg-white flex items-center justify-between px-6 fixed top-0 z-50 border-b border-gray-300">
      {/* Logo */}
      <Image src={focusLogo} width={121} height={58} alt="focus-logo" />

      {/* Search Bar */}
      <div className="flex-grow mx-20">
        <input
          type="text"
          placeholder="Search for a post"
          className="w-full h-11 px-4 rounded-xl bg-[#F3F3F3] tracking-wide"
        />
      </div>

      {/* Create Post Button */}
      <button
        className="bg-blue text-xl text-white font-semibold w-[184px] h-[45px] rounded-[12px]"
        onClick={() => router.push("/create-post")}
      >
        Create Post
      </button>

      {/* Profile Picture + Dropdown */}
      <div
        className="flex items-center justify-center ml-4 w-[88px] h-full relative group hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
        onClick={toggleDropdown}
      >
        {/* Profile Picture Circle */}
        <div className="border-l pl-4">
          <div className="w-[46px] h-[46px] bg-pink-300 rounded-full flex items-center justify-center cursor-pointer">
            <span className="text-black font-bold text-lg">D</span>
          </div>
        </div>

        {/* Arrow Icon */}
        <div className="cursor-pointer ml-2">
          {menuIsOpen ? <span>&uarr;</span> : <span>&darr;</span>}
        </div>

        {/* Blue line when menu is open */}
        {menuIsOpen && (
          <div className="absolute bottom-[-1px] left-0 w-full h-[6px] bg-blue"></div>
        )}
      </div>

      {/* Dropdown Menu */}
      {menuIsOpen && (
        <div className="absolute right-0 top-[100px] w-[180px] bg-white rounded-md z-10 border border-gray-300">
          <div className="w-[60px] h-[60px] bg-pink-300 rounded-full flex items-center justify-center m-auto mt-2">
            <span className="text-black font-bold text-3xl">D</span>
          </div>

          <ul className="p-2 text-center">
            <li
              className="py-1 px-4 hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => {
                router.push("/profile");
              }}
            >
              Profile
            </li>
            <li
              className="py-1 px-4 hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => {
                router.push("/saved-posts");
              }}
            >
              Saved Posts
            </li>
            <li
              className="py-1 px-4 hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => {
                router.push("/profile/settings");
              }}
            >
              Settings
            </li>
            <li className="py-[16px] mx-6 cursor-pointer border-t mt-2 font-bold">
              <button
                className="w-full py-[2px] px-4 text-gray-700 bg-gray-100 border border-gray-300 rounded-sm hover:bg-gray-300"
                onClick={() => {
                  router.push("/login");
                }}
              >
                Log Out
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
