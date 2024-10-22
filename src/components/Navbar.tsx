"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import focusLogo from "@/../public/focus-logo.png";
import Image from "next/image";
import { SquarePen } from "lucide-react";
import { Search } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { ChevronUp } from "lucide-react";
import Link from "next/link";
import useClickOff from "@/hooks/useClickOff";
import { signOut } from "@/server/db/actions/UserActions";
import { User } from "@/utils/types/user";

interface NavbarProps {
  openModal: () => void;
  user: User;
}

export default function Navbar({ openModal, user }: NavbarProps) {
  const router = useRouter();
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownButtonRef = useRef<HTMLDivElement>(null);

  useClickOff(dropdownRef, () => setMenuIsOpen(false), [dropdownRef, dropdownButtonRef]);

  const toggleDropdown = () => {
    setMenuIsOpen(!menuIsOpen);
  };

  return (
    <div className="w-full h-[100px] bg-white flex items-center justify-between fixed top-0 z-50 border-b border-gray-300">
      {/* Logo plus search bar*/}
      <Image src={focusLogo} width={121} height={58} alt="focus-logo" className="mx-12 mb-2"/> 
      <div className="relative flex-grow mx-20">
        <input
          type="text"
          placeholder="Search for a post"
          className="w-full h-11 px-12 rounded-[20px] bg-[#F3F3F3] tracking-wide pl-16 focus:outline-none"
        />
        <Search strokeWidth={3} className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-500" />
      </div>

      {/* Create Post*/}
      <button
        className="bg-theme-blue text-xl px-6 text-white font-semibold w-[184px] h-[45px] rounded-[12px] gap-2 flex flex-row justify-center items-center hover:opacity-90 whitespace-nowrap"
        onClick={() => openModal()}
      >
        <SquarePen color="#ffffff" /> Create Post
      </button>

      {/* Profile Picture menu button */}
      <div
        className="flex items-center justify-center mx-6 mr-2 w-[88px] h-full relative group hover:bg-gray-100 transition-colors duration-200 cursor-pointer m-1 pr-16 pl-12"
        onClick={toggleDropdown}
        ref={dropdownButtonRef}
      >
        <div className="border-l pl-6">
          <div className="w-[46px] h-[46px] bg-pink-300 rounded-full flex items-center justify-center cursor-pointer">
            <span className="text-black font-bold text-lg  select-none">{user.lastName.charAt(0).toUpperCase()}</span>
          </div>
        </div>
        <div className="cursor-pointer ml-2">
          {menuIsOpen ? <ChevronUp className="w-4 h-4" color="#7D7E82"/> : <ChevronDown className="w-4 h-4" color="#7D7E82"/>}
        </div>
        {menuIsOpen && (
          <div className="absolute bottom-[-1px] left-0 w-full h-[4px] bg-theme-blue"></div>
        )}
      </div>

      {/* Dropdown Menu */}
      {menuIsOpen && (
        <div className="absolute right-[10px] top-[110px] w-[218px] h-[307] bg-white z-10 border border-gray-300 rounded-lg" ref={dropdownRef}>
          <div className="w-[64px] h-[64px] bg-pink-300 rounded-full flex items-center justify-center m-auto mt-[21px]">
            <span className="text-black font-bold text-3xl">{user.lastName.charAt(0).toUpperCase()}</span>
          </div>

          <div className="p-2 text-center text-theme-gray">
            <p className="text-lg">{user.lastName} Family</p>
            <p className="text-sm">{user.email}</p>
            <div className="w-44 border-theme-lightgray border-t border-sm mt-[18px] mx-auto"/>
            <Link href={`/family/${user._id}`} onClick={toggleDropdown} className="block mt-4 ml-4 py-1 hover:underline cursor-pointer transition-colors text-left">
              My Profile
            </Link>
            <Link href="/profile/settings" onClick={toggleDropdown} className="block mt-2 ml-4 py-1 hover:underline cursor-pointer transition-colors text-left">
              Settings & Preferences
            </Link>
            <div className="w-44 border-theme-lightgray border-t border-sm mt-[18px] mx-auto"/>
            <Link
              href="/login"
              onClick={async () => {
                await signOut();
              }} 
              className="text-theme-blue mt-2 mb-2 block ml-4 py-1 hover:underline cursor-pointer transition-colors text-left"
            >
              Sign out
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
