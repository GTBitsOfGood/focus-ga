"use client";

import { useState, useRef } from "react";
import focusLogo from "@/../public/focus-logo.png";
import Image from "next/image";
import { SquarePen, Search, ChevronDown, ChevronUp, X } from "lucide-react";
import Link from "next/link";
import useClickOff from "@/hooks/useClickOff";
import { signOut } from "@/server/db/actions/AuthActions";
import { ProfileColors } from "@/utils/consts";
import { useUser } from "@/contexts/UserContext";
import { useSearch } from "@/contexts/SearchContext";
import { useRouter } from "next/navigation";

interface NavbarProps {
  openModal: () => void;
}

export default function Navbar({ openModal }: NavbarProps) {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownButtonRef = useRef<HTMLDivElement>(null);
  const { user, setUser } = useUser()
  const { searchTerm, setSearchTerm } = useSearch();
  const router = useRouter();

  useClickOff(dropdownRef, () => setMenuIsOpen(false), [dropdownRef, dropdownButtonRef]);

  const toggleDropdown = () => {
    setMenuIsOpen(!menuIsOpen);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchTerm(inputValue);
      router.push("/");
    }
  };

  const clearSearch = () => {
    setInputValue("");
    setSearchTerm("");
  }
  
  if (!user) {
    return
  }

  return (
    <div className="w-full h-[100px] bg-white flex items-center justify-between fixed top-0 z-50 border-b border-gray-300">
      {/* Logo plus search bar*/}
      <Link href="/" className="cursor-pointer">
        <Image src={focusLogo} width={121} height={58} alt="focus-logo" className="mx-12 mb-2" />
      </Link>
      <div className="relative flex-grow mx-20">
        <input
          type="text"
          placeholder="Search for a post"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full h-11 px-12 rounded-[20px] bg-[#F3F3F3] tracking-wide pl-16 focus:outline-none"
        />
        <Search strokeWidth={3} className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-500" />
        {
          inputValue.length ? (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              <X strokeWidth={2} />
            </button>
          ) : null
        }
      </div>

      {/* Create Post*/}
      <button
        className="bg-theme-blue text-base py-2 px-[18px] mr-10 text-white font-semibold rounded-[12px] gap-2 flex flex-row justify-center items-center transition hover:opacity-90 whitespace-nowrap"
        onClick={() => openModal()}
      >
        <SquarePen className="w-6 h-6" color="#ffffff" /> Create Post
      </button>

      {/* Profile Picture menu button */}
      <div
        className="flex items-center justify-center mx-6 mr-2 w-[88px] h-full relative group hover:bg-gray-100 transition-colors duration-200 cursor-pointer m-1 pr-16 pl-12"
        onClick={toggleDropdown}
        ref={dropdownButtonRef}
      >
        <div className="border-l pl-6">
          <div className={`w-[46px] h-[46px] bg-${user.profileColor? user.profileColor: ProfileColors.ProfileDefault} rounded-full flex items-center justify-center cursor-pointer`}>  {/** Change to whatever color is chosen */}
            <span className="text-black font-bold text-lg select-none">{user.lastName.charAt(0).toUpperCase()}</span>
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
        <div className="absolute right-[10px] top-[110px] w-[218px] h-[307] bg-white z-10 border border-theme-medlight-gray rounded-lg" ref={dropdownRef}>
          <div className={`w-[64px] h-[64px] bg-${user.profileColor? user.profileColor: ProfileColors.ProfileDefault} rounded-full flex items-center justify-center m-auto mt-[21px]`}>
            <span className="text-black font-bold text-3xl select-none">{user.lastName.charAt(0).toUpperCase()}</span>
          </div>

          <div className="p-2 text-center text-theme-gray">
            <p className="text-lg">{user.lastName} Family</p>
            <p className="text-sm">{user.email}</p>
            <div className="w-44 border-theme-medlight-gray border-t border-sm mt-[18px] mx-auto"/>
            <Link href={`/`} onClick={toggleDropdown} className="block mt-4 ml-4 py-1 hover:underline cursor-pointer transition-colors text-left">
              Home
            </Link>
            <Link href={`/family/${user._id}`} onClick={toggleDropdown} className="block mt-2 ml-4 py-1 hover:underline cursor-pointer transition-colors text-left">
              My Profile
            </Link>
            <Link href="/profile/settings" onClick={toggleDropdown} className="block mt-2 ml-4 py-1 hover:underline cursor-pointer transition-colors text-left">
              Settings & Preferences
            </Link>
            <div className="w-44 border-theme-medlight-gray border-t border-sm mt-[18px] mx-auto"/>
            <Link
              href="/login"
              onClick={async () => {
                setUser(null);
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
