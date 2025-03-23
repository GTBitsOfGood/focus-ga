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
};

export default function UserIcon({ user, clickable, boldText }: UserIconProps) {
  const inner = (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center cursor-pointer",
          `bg-${user?.profileColor || ProfileColors.ProfileDefault}`
        )}
      >
        <span className="text-black text-sm font-bold select-none">
          {user?.lastName.charAt(0).toUpperCase() || 'D'}
        </span>
      </div>
      <span className={cn(
        { 'font-bold text-black': boldText },
      )}>
        {user 
          ? `${user.lastName.charAt(0).toUpperCase()}${user.lastName.slice(1)} Family • ${user.city}, GA` 
          : 'Deleted User'}
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

      {user?.isAdmin && <ShieldCheck className="admin-icon w-5 h-5 text-white fill-theme-gray" />}
      <Tooltip anchorSelect=".admin-icon" className="text-xs py-1">Admin User</Tooltip>
    </div>
  );
}