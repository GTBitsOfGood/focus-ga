'use client';
import UserIcon from "@/components/UserIconComponent";
import { FormEvent, useState } from "react";
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast";
import { getUserByEmail, editUser } from "@/server/db/actions/UserActions";


/* 
THIS PAGE USES THE FOLLOW OBJECT PROPERTIES:
  USER:
    - LASTNAME (IN USERICON)
    - EMAIL (IN USERICON)
    - ISADMIN (IN USERICON)
*/

//remove test data
const testUser : any = {
  lastName: "Zhang (Winnie)",
  email: "kdjfalskdjflskjdflkdjfs@gmail.com",
  isAdmin: true,
}


export default function AdminPrivileges({ users } : {users : any[]}) {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const notifySuccess = (email : string) => {
    toast({
      title: "Successfully added admin!",
      description: `User with email ${email} was added as an admin.`,
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

  const handleSubmit = async (event : FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const user = await getUserByEmail(email);
      await editUser(user._id, {isAdmin: true});
      notifySuccess(email);
      setEmail("");

    } catch (error) {
      notifyFailure();
      throw error;
    }
    }
  
  return (
    <div className="mt-9 max-w-[78%] md:ml-10">
      <h1 className="text-2xl font-bold mb-[33px]">Admin Privileges</h1>
      <form className="flex flex-col mb-[42px]" onSubmit={handleSubmit}>
        <label className="text-xl mb-[10px]">Add New Admin Account</label>
        <div className="flex justify-between">
        <input type="text" placeholder="Enter Email Address" className="w-[100%] border-[1px] rounded-md text-sm pl-[13px]" value={email} onChange={handleEmailChange}></input>
        <button className="rounded-md bg-theme-blue text-white pl-[25px] pr-[25px] pt-2 pb-2 text-lg ml-[13px]">Add</button>
        </div>
      </form>
      <div className="flex flex-col gap-3 ">
        <h2 className="text-xl mb-[14px]">Current Admin Accounts</h2>
        {/*REMOVE TEST DATA*/}
        <AdminAccount user={testUser} />
        <AdminAccount user={testUser} />
        <AdminAccount user={testUser} />
      </div>
    </div>
  );
}

const AdminAccount = ({ user } : { user : any}) => {
  return (
  <div className="text-xl flex justify-between align-middle border-b-[1px] pb-5 mb-2 flex-wrap">
      <UserIcon user={user} showEmail={true} showLargeIcon={true}/>
      <button className="rounded-md bg-[#EAEAEA] text-theme-gray text-lg mt-3 mb-3 pl-4 pr-4  font-bold ml-[13px]">Remove</button>
  </div>
  )
}

