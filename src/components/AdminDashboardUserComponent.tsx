import { ProfileColors } from "@/utils/consts";
import { PopulatedUser, User } from "@/utils/types/user";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Tooltip } from 'react-tooltip';


type AdminDashboardUser = {
    user: User | PopulatedUser | null;
    buttonText: string;
    handleSubmit: any;
    clickable?: boolean;
    boldText?: boolean;
  };


export default function AdminDashboardUser ({ user, buttonText, handleSubmit, clickable, boldText} : AdminDashboardUser) {

    const inner = (
        <div className="flex items-center gap-2">
          <div
            className={cn(
              `rounded-full flex items-center justify-center cursor-pointer w-[64px] h-[64px]`,
              `bg-${user?.profileColor || ProfileColors.ProfileDefault}`
            )}
          >
            <span className={`text-black font-bold select-none text-xl`}>
              {user?.lastName.charAt(0).toUpperCase() || 'D'}
            </span>
          </div>
          <span className={`${cn(
            { 'font-bold text-black': boldText },
          )} flex flex-col `}>
            <div className="flex items-center gap-2">
            {user ? `${user.lastName} Family` : 'Deleted User'}
            {user?.isAdmin && <ShieldCheck className={`admin-icon text-white fill-theme-gray w-7 h-7`} />}
            </div>
            <span className="text-sm">{user?.email} </span>
          </span>
        </div>
      );

    return (
    <div className="text-xl flex justify-between align-middle border-b-[1px] pb-5 mb-2 flex-wrap">
        <div className="flex items-center gap-1">
      {clickable ? (
        inner
      ) : (
        <Link href={`/family/${user?._id}`}>
          {inner}
        </Link>
      )}
      <Tooltip anchorSelect=".admin-icon" className="text-xs py-1">Admin User</Tooltip>
    </div>
        <button className="rounded-md bg-[#EAEAEA] text-theme-gray text-lg mt-3 mb-3 pl-4 pr-4 font-bold ml-[13px]" onClick={(event) => {handleSubmit(event, user)}}>{buttonText}</button>
    </div>
    )
}