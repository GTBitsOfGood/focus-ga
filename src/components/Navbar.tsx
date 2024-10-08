"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import focusLogo from "@/../public/focus-logo.png";
import Image from "next/image";
import { SquarePen } from "lucide-react";
import { Search } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { ChevronUp } from "lucide-react";
import Link from "next/link";

interface Props {
  openModal: () => void;
}

export default function Navbar( props: Props ) {
  const router = useRouter();
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  const toggleDropdown = () => {
    setMenuIsOpen(!menuIsOpen);
  };

  return (
    <div className="w-full h-[100px] bg-white flex items-center justify-between pl-6 fixed top-0 z-50 border-b border-gray-300">
      {/* Logo plus saerch bar*/}
      <Image src={focusLogo} width={121} height={58} alt="focus-logo" />
      <div className="relative flex-grow mx-20">
        <input
          type="text"
          placeholder="Search for a post"
          className="w-full h-11 px-12 rounded-xl bg-[#F3F3F3] tracking-wide pl-16 focus:outline-none"
        />
        <Search strokeWidth={3} className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-500" />
      </div>

      {/* Create Post*/}
      <button
        className="bg-blue text-xl text-white font-semibold w-[184px] h-[45px] rounded-[12px] gap-2 flex flex-row justify-center items-center hover:opacity-90"
        onClick={() => props.openModal()}
      >
        <SquarePen color="#ffffff" /> Create Post
      </button>

      {/* Profile Picture menu button */}
      <div
        className="flex items-center justify-center ml-4 w-[88px] h-full relative group hover:bg-gray-100 transition-colors duration-200 cursor-pointer m-1 pr-16 pl-12"
        onClick={toggleDropdown}
      >
        <div className="border-l pl-6">
          <div className="w-[46px] h-[46px] bg-pink-300 rounded-full flex items-center justify-center cursor-pointer">
            <span className="text-black font-bold text-lg  select-none">D</span> {/** TODO: Change "D" to the initial of the family name */}
          </div>
        </div>
        <div className="cursor-pointer ml-2">
          {menuIsOpen ? <ChevronUp className="w-4 h-4" color="#7D7E82"/> : <ChevronDown className="w-4 h-4" color="#7D7E82"/>}
        </div>
        {menuIsOpen && (
          <div className="absolute bottom-[-1px] left-0 w-full h-[4px] bg-blue"></div>
        )}
      </div>

      {/* Dropdown Menu */}
      {menuIsOpen && (
        <div className="absolute right-0 top-[100px] w-[180px] bg-white rounded-md z-10 border border-gray-300">
          <div className="w-[60px] h-[60px] bg-pink-300 rounded-full flex items-center justify-center m-auto mt-2">
            <span className="text-black font-bold text-3xl">D</span>
          </div>

          <div className="p-2 text-center">
            <Link href="/profile" className="block py-1 px-4 hover:bg-gray-100 cursor-pointer transition-colors">
              Profile
            </Link>
            <Link href="/saved-posts" className="block py-1 px-4 hover:bg-gray-100 cursor-pointer transition-colors">
              Saved Posts
            </Link>
            <Link href="/profile/settings" className="block py-1 px-4 hover:bg-gray-100 cursor-pointer transition-colors">
              Settings
            </Link>
            <Link href="/login" className="block py-[16px] mx-6 cursor-pointer border-t mt-2 font-bold">
              <button className="w-full py-[2px] px-4 text-gray-700 bg-gray-100 border border-gray-300 rounded-sm hover:bg-gray-200">
                Log Out
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
