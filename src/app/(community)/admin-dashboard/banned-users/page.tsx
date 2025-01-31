"use client";

import { toast } from "@/hooks/use-toast";
import { editUser, getUserByEmail } from "@/server/db/actions/UserActions";
import { useState, useEffect } from "react";

export default function BannedUsers() {
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<boolean>(false);

  const handleBanClick = async () => {
    try {
      const user = await getUserByEmail(email);
      setEmailError(false);
      await editUser(user._id, { isBanned: true });
      notifySuccess();
      setEmail("");
    } catch (e: any) {
      if (e.message && e.message === "User not found") {
        setEmailError(true);
      } else {
        console.error(e);
      }
    }
  };

  const notifySuccess = () => {
    toast({
      title: "User successfully banned",
      description: `User account associated with email ${email} will no longer be able to access this website.`,
    });
  };

  return (
    <div className="h-full border-2 border-black p-4">
      <h1 className="text-2xl font-bold text-black">Banned Users</h1>
      <h3 className="font-lato mt-8 text-xl font-normal text-black">
        Add New Banned User
      </h3>
      <div className="mt-2.5 flex flex-row items-center justify-start">
        <input
          type="text"
          placeholder="Enter email address"
          className={`border ${emailError ? "border-[#ff4e4e]" : "border-gray-300"} h-10 w-full rounded-lg bg-white px-3`}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError(false);
          }}
        />
        <button
          className="ml-3 h-10 rounded-lg bg-theme-gray px-6 text-base font-bold text-white"
          onClick={handleBanClick}
        >
          Ban
        </button>
      </div>
      {emailError ? (
        <div className="absolute text-sm font-normal text-[#ff4e4e]">
          Invalid user email
        </div>
      ) : null}
      <h3 className="font-lato mt-10 text-xl font-normal text-black">
        Currently Banned Users
      </h3>
    </div>
  );
}
