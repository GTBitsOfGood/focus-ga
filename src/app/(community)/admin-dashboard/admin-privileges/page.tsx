'use client';
import { User } from "@/utils/types/user";
import { FormEvent, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getUserByEmail, editUser, getAdminUsers } from "@/server/db/actions/UserActions";
import AdminDashboardUser from "@/components/AdminDashboardUserComponent";


export default function AdminPrivileges() {
  
  const [email, setEmail] = useState("");
  const [admins, setAdmins] = useState<User[]>([]);
  const { toast } = useToast();

  useEffect(()=> {
    fetchSortedAdmins();
  }, [])

  const fetchSortedAdmins = async () => {
    try {
      const initAdmins = await getAdminUsers();
      initAdmins.sort((a,b) => a.lastName.localeCompare(b.lastName));
      setAdmins(initAdmins);
    } catch (error) {
      throw error;
    }
  }

  const notifySuccess = (email : string) => {
    toast({
      title: "Successfully added admin!",
      description: `User with email ${email} was added as an admin.`,
    });
  };

  const notifyAlreadyAdmin = (email : string) => {
    toast({
      title: `Already Admin!`,
      description: `User with email ${email} is already an admin.`,
    });
  };

  const notifyFailure = () => {
    toast({
      title: "Failed to add admin",
      description: "The user does not exist.",
    });
  };

  const handleEmailChange = (event : React.ChangeEvent<HTMLInputElement>) => {
      setEmail(event.target.value);
  };

  const handleAdd = async (event : FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const user = await getUserByEmail(email);
      if (user.isAdmin) {
        notifyAlreadyAdmin(email);
        setEmail("");
        return;
      }
      const updatedUser = await editUser(user._id, {isAdmin: true});
      notifySuccess(email);
      setEmail("");
      fetchSortedAdmins();
    } catch (error) {
      notifyFailure();
      throw error;
    }
  }

  const notifyRemoveSuccess = (email : string) => {
    toast({
      title: "Successfully removed admin!",
      description: `User with email ${email} was removed as an admin.`,
    });
  };

  const notifyRemoveFailure = (email : string) => {
    toast({
      title: "Failed to remove admin.",
      description: `User with email ${email} was failed to be removed as admin.`,
    });
  };

  const handleRemove = async (event: React.MouseEvent<HTMLButtonElement>, user : User) => {
    try {
      const updatedUser = await editUser(user._id, {isAdmin: false});
      fetchSortedAdmins();
      notifyRemoveSuccess(user.email);
    } catch (error) {
      notifyRemoveFailure(user.email);
    }
  }
  
  return (
    <div className="mt-9 max-w-[78%] md:ml-10">
      <h1 className="text-2xl font-bold mb-[33px]">Admin Privileges</h1>
      <form className="flex flex-col mb-[42px]" onSubmit={handleAdd}>
        <label className="text-xl mb-[10px]">Add New Admin Account</label>
        <div className="flex justify-between">
        <input type="text" placeholder="Enter Email Address" className="w-[100%] border-[1px] rounded-md text-sm pl-[13px]" value={email} onChange={handleEmailChange}></input>
        <button className="rounded-md bg-theme-blue text-white pl-[25px] pr-[25px] pt-2 pb-2 text-lg ml-[13px] font-bold">Add</button>
        </div>
      </form>
      <div className="flex flex-col gap-3 ">
        <h2 className="text-xl mb-[14px]">Current Admin Accounts</h2>
        {admins.map((user) => <AdminDashboardUser user={user} handleSubmit={handleRemove} buttonText={"Remove"} key={user._id}/>)}
      </div>
    </div>
  );
}


