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
import { ShieldCheck } from "lucide-react";
import { Tooltip } from "react-tooltip";

interface NavbarProps {
  openModal: () => void;
}

export default function Navbar({ openModal }: NavbarProps) {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownButtonRef = useRef<HTMLDivElement>(null);
  const { user, setUser } = useUser();
  const { searchTerm, setSearchTerm } = useSearch();
  const router = useRouter();

  useClickOff(dropdownRef, () => setMenuIsOpen(false), [
    dropdownRef,
    dropdownButtonRef,
  ]);

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
  };

  if (!user) {
    return;
  }

  return (
    <div className="fixed top-0 z-50 flex h-[100px] w-full items-center justify-between gap-4 border-b border-gray-300 bg-white pl-8 md:gap-12">
      {/* Logo plus search bar*/}
      <Link href="/" className="cursor-pointer">
        <Image
          src={focusLogo}
          alt="focus-logo"
          className="mb-2 w-24 min-w-24"
        />
      </Link>
      <div className="relative flex-grow">
        <input
          type="text"
          placeholder="Search for a post"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-11 w-full rounded-[20px] bg-theme-lightgray px-12 pl-16 tracking-wide focus:outline-none"
        />
        <Search
          strokeWidth={3}
          className="absolute left-6 top-1/2 -translate-y-1/2 transform text-gray-500"
        />
        {inputValue.length ? (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 transform text-gray-500"
          >
            <X strokeWidth={2} />
          </button>
        ) : null}
      </div>

      {/* Create Post*/}
      {!user.isBanned && (
        <button
          className="flex flex-row items-center justify-center gap-2 whitespace-nowrap rounded-[12px] bg-theme-blue px-4 py-2 text-base font-semibold text-white transition hover:opacity-90"
          onClick={() => openModal()}
        >
          <SquarePen className="h-6 w-6" color="#ffffff" /> Create Post
        </button>
      )}

      {/* Profile Picture menu button */}
      <div
        className="group relative flex h-full w-[88px] cursor-pointer items-center justify-center pl-12 pr-16 transition-colors duration-200 hover:bg-gray-100"
        onClick={toggleDropdown}
        ref={dropdownButtonRef}
      >
        <div className="border-l pl-6">
          <div
            className={`h-[46px] w-[46px] bg-${user.profileColor ? user.profileColor : ProfileColors.ProfileDefault} flex cursor-pointer items-center justify-center rounded-full`}
          >
            {" "}
            {/** Change to whatever color is chosen */}
            <span className="select-none text-lg font-bold text-black">
              {user.lastName.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <div className="ml-2 cursor-pointer">
          {menuIsOpen ? (
            <ChevronUp className="h-4 w-4" color="#7D7E82" />
          ) : (
            <ChevronDown className="h-4 w-4" color="#7D7E82" />
          )}
        </div>
        {menuIsOpen && (
          <div className="absolute bottom-[-1px] left-0 h-[4px] w-full bg-theme-blue"></div>
        )}
      </div>

      {/* Dropdown Menu */}
      {menuIsOpen && (
        <div
          className="absolute right-[10px] top-[110px] z-10 w-[218px] rounded-lg border border-theme-medlight-gray bg-white"
          ref={dropdownRef}
        >
          <div
            className={`h-[64px] w-[64px] bg-${user.profileColor ? user.profileColor : ProfileColors.ProfileDefault} m-auto mt-[21px] flex items-center justify-center rounded-full`}
          >
            <span className="select-none text-3xl font-bold text-black">
              {user.lastName.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="p-2 text-center text-theme-gray">
            <div className="flex flex-row justify-center">
              <p className="text-lg">{user.lastName} Family</p>
              {user?.isAdmin && (
                <ShieldCheck className="admin-icon mt-1 h-5 w-5 fill-theme-gray text-white" />
              )}
              <Tooltip anchorSelect=".admin-icon" className="py-1 text-xs">
                Admin User
              </Tooltip>
            </div>
            <p className="text-sm">{user.email}</p>
            <div className="border-sm mx-auto mt-[18px] w-44 border-t border-theme-medlight-gray" />
            <Link
              href={`/`}
              onClick={toggleDropdown}
              className="ml-4 mt-4 block cursor-pointer py-1 text-left transition-colors hover:underline"
            >
              Home
            </Link>
            <Link
              href={`/family/${user._id}`}
              onClick={toggleDropdown}
              className="ml-4 mt-2 block cursor-pointer py-1 text-left transition-colors hover:underline"
            >
              My Profile
            </Link>
            <Link
              href="/profile/settings"
              onClick={toggleDropdown}
              className="ml-4 mt-2 block cursor-pointer py-1 text-left transition-colors hover:underline"
            >
              Settings & Preferences
            </Link>
            <Link
              href="https://mapscout.io/focus"
              onClick={toggleDropdown}
              target="_blank"
              className="ml-4 mt-2 block cursor-pointer py-1 text-left transition-colors hover:underline"
            >
              Map of Resources
            </Link>
            {user?.isAdmin && (
              <Link
                href={`/admin-dashboard/admin-privileges`}
                onClick={toggleDropdown}
                className="ml-4 mt-2 block cursor-pointer py-1 text-left font-bold transition-colors hover:underline"
              >
                Admin Dashboard
              </Link>
            )}
            <div className="border-sm mx-auto mt-[18px] w-44 border-t border-theme-medlight-gray" />
            <div
              onClick={async () => {
                setUser(null);
                await signOut();
                router.push("/");
              }}
              className="mb-2 ml-4 mt-2 block cursor-pointer py-1 text-left text-theme-blue transition-colors hover:underline"
            >
              Sign out
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
