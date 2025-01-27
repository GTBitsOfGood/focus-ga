import { ProfileColors } from "@/utils/consts";
import { PopulatedUser, User } from "@/utils/types/user";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Tooltip } from 'react-tooltip'

type UserIconProps = {
  user: User | PopulatedUser | null;
  clickable?: boolean;
  boldText?: boolean;
  deleted?: boolean;
  showEmail?: boolean;
  showLargeIcon?: boolean
};

export default function UserIcon({ user, clickable, boldText, showEmail, showLargeIcon }: UserIconProps) {
  const inner = (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          `w-6 h-6 rounded-full flex items-center justify-center cursor-pointer ${showLargeIcon && 'w-[64px] h-[64px]'}`,
          `bg-${user?.profileColor || ProfileColors.ProfileDefault}`
        )}
      >
        <span className={`text-black text-sm font-bold select-none ${showLargeIcon && 'text-xl'}`}>
          {user?.lastName.charAt(0).toUpperCase() || 'D'}
        </span>
      </div>
      <span className={`${cn(
        { 'font-bold text-black': boldText },
      )} flex flex-col `}>
        <div className="flex items-center gap-2">
        {user ? `${user.lastName} Family` : 'Deleted User'}
        {user?.isAdmin && <ShieldCheck className={`admin-icon w-5 h-5 text-white fill-theme-gray ${showLargeIcon && 'w-7 h-7'}`} />}
        </div>
        {showEmail && <span className="text-sm">{user?.email} </span>}
      </span>
    </div>
  );

  return (
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
  );
}