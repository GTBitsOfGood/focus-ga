"use client";

import AdminDashboardUser from "@/components/AdminDashboardUser";
import { toast } from "@/hooks/use-toast";
import {
  editUser,
  getBannedUsers,
  getUserByEmail,
} from "@/server/db/actions/UserActions";
import { User } from "@/utils/types/user";
import { useState, useEffect } from "react";

export default function BannedUsers() {
  const [bannedUsers, setBannedUsers] = useState<User[]>([]);
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<boolean>(false);

  useEffect(() => {
    fetchBannedUsers();
  }, []);

  const fetchBannedUsers = async () => {
    try {
      const users = await getBannedUsers();
      if (users.length != 0) {
        users.sort((a, b) => a.lastName.localeCompare(b.lastName));
      }
      setBannedUsers(users);
    } catch (error) {
      console.error(error);
    }
  };

  const handleBanClick = async () => {
    try {
      const user = await getUserByEmail(email);
      setEmailError(false);
      await editUser(user._id, { isBanned: true });
      notifySuccess();
      setEmail("");
      fetchBannedUsers();
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
      description: `The account associated with email ${email} will no longer be able to access any posts.`,
    });
  };

  const handleRemove = async (
    event: React.MouseEvent<HTMLButtonElement>,
    user: User,
  ) => {
    try {
      await editUser(user._id, { isBanned: false });
      fetchBannedUsers();
      notifyRemoveSuccess(user.email);
    } catch (error) {
      notifyRemoveFailure(user.email);
    }
  };

  const notifyRemoveSuccess = (email: string) => {
    toast({
      title: "Successfully unbanned!",
      description: `User with email ${email} was unbanned.`,
    });
  };

  const notifyRemoveFailure = (email: string) => {
    toast({
      title: "Failed to unban.",
      description: `User with email ${email} was failed to be unbanned.`,
    });
  };

  return (
    <div className="mt-9 max-w-[78%] md:ml-10">
      <h1 className="text-2xl font-bold text-black">Banned Users</h1>
      <h3 className="font-lato mt-8 text-xl font-normal text-black">
        Add New Banned User
      </h3>
      <div className="mt-2.5 flex flex-row items-center justify-start text-sm">
        <input
          type="text"
          placeholder="Enter email address"
          className={`border ${emailError ? "border-error-red" : "border-gray-300"} h-10 w-full rounded-lg bg-white px-3`}
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
        <div className="absolute text-sm font-normal text-error-red">
          Invalid user email
        </div>
      ) : null}
      <div className="flex flex-col gap-3">
        <h2 className="mb-3.5 mt-10 text-xl font-normal text-black">
          Currently Banned Users
        </h2>
        {bannedUsers.map((user) => (
          <AdminDashboardUser
            user={user}
            handleSubmit={handleRemove}
            buttonText={"Unban"}
            key={user._id}
          />
        ))}
      </div>
    </div>
  );
}
