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
  const [emailError, setEmailError] = useState<boolean>(false);
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

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    setEmailError(false);
  };

  const handleAdd = async () => {
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
      setEmailError(true);
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
      <h1 className="mb-8 text-2xl font-bold">Admin Privileges</h1>
      <label className="mb-2.5 text-xl">Add New Admin Account</label>
      <div className="mt-2.5 flex justify-between text-sm">
        <input
          type="text"
          placeholder="Enter email address"
          className={`border ${emailError ? "border-error-red" : "border-gray-300"} h-10 w-full rounded-lg bg-white px-3`}
          value={email}
          onChange={handleEmailChange}
        ></input>
        <button
          onClick={handleAdd}
          className="ml-3 h-10 rounded-lg bg-theme-blue px-6 text-base font-bold text-white transition hover:opacity-90"
        >
          Add
        </button>
      </div>
      {emailError ? (
        <div className="absolute text-sm font-normal text-error-red">
          Invalid user email
        </div>
      ) : null}
      <div className="flex flex-col gap-3">
        <h2 className="mb-3.5 mt-10 text-xl">Current Admin Accounts</h2>
        {admins.map((user) => (
          <AdminDashboardUser
            user={user}
            handleSubmit={handleRemove}
            buttonText={"Remove"}
            key={user._id}
          />
        ))}
      </div>
    </div>
  );
}
