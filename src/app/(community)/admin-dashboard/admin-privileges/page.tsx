"use client";
import { User } from "@/utils/types/user";
import { FormEvent, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  getUserByEmail,
  editUser,
  getAdminUsers,
} from "@/server/db/actions/UserActions";
import AdminDashboardUser from "@/components/AdminDashboardUser";

export default function AdminPrivileges() {
  const [email, setEmail] = useState("");
  const [admins, setAdmins] = useState<User[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchSortedAdmins();
  }, []);

  const fetchSortedAdmins = async () => {
    try {
      const initAdmins = await getAdminUsers();
      if (initAdmins.length != 0) {
        initAdmins.sort((a, b) => a.lastName.localeCompare(b.lastName));
      }
      setAdmins(initAdmins);
    } catch (error) {
      console.error(error);
    }
  };

  const notifySuccess = (email: string) => {
    toast({
      title: "Successfully added admin!",
      description: `User with email ${email} was added as an admin.`,
    });
  };

  const notifyAlreadyAdmin = (email: string) => {
    toast({
      title: `Already admin!`,
      description: `User with email ${email} is already an admin.`,
    });
  };

  const notifyFailure = () => {
    toast({
      title: "Failed to add admin",
      description: `User with email ${email} does not exist.`,
    });
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const user = await getUserByEmail(email);
      if (user.isAdmin) {
        notifyAlreadyAdmin(email);
        setEmail("");
        return;
      }
      await editUser(user._id, { isAdmin: true });
      notifySuccess(email);
      setEmail("");
      fetchSortedAdmins();
    } catch (error) {
      notifyFailure();
    }
  };

  const notifyRemoveSuccess = (email: string) => {
    toast({
      title: "Successfully removed admin!",
      description: `User with email ${email} was removed as an admin.`,
    });
  };

  const notifyRemoveFailure = (email: string) => {
    toast({
      title: "Failed to remove admin.",
      description: `User with email ${email} was failed to be removed as admin.`,
    });
  };

  const handleRemove = async (
    event: React.MouseEvent<HTMLButtonElement>,
    user: User,
  ) => {
    try {
      await editUser(user._id, { isAdmin: false });
      fetchSortedAdmins();
      notifyRemoveSuccess(user.email);
    } catch (error) {
      notifyRemoveFailure(user.email);
    }
  };

  return (
    <div className="mt-9 max-w-[78%] md:ml-10">
      <h1 className="mb-[33px] text-2xl font-bold">Admin Privileges</h1>
      <form className="mb-[42px] flex flex-col" onSubmit={handleAdd}>
        <label className="mb-[10px] text-xl">Add New Admin Account</label>
        <div className="flex justify-between">
          <input
            type="text"
            placeholder="Enter Email Address"
            className="w-[100%] rounded-md border-[1px] pl-[13px] text-sm"
            value={email}
            onChange={handleEmailChange}
          ></input>
          <button className="ml-[13px] rounded-md bg-theme-blue pb-2 pl-[25px] pr-[25px] pt-2 text-lg font-bold text-white">
            Add
          </button>
        </div>
      </form>
      <div className="flex flex-col gap-3">
        <h2 className="mb-[14px] text-xl">Current Admin Accounts</h2>
        {admins.map((user) => (
          <AdminDashboardUser
            user={user}
            handleSubmit={handleRemove}
            buttonText={"Remove"}
            clickable={true}
            key={user._id}
          />
        ))}
      </div>
    </div>
  );
}
