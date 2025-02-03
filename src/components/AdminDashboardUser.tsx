import { ProfileColors } from "@/utils/consts";
import { PopulatedUser, User } from "@/utils/types/user";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Tooltip } from "react-tooltip";

type AdminDashboardUser = {
  user: User | PopulatedUser | null;
  buttonText: string;
  handleSubmit: any;
  clickable?: boolean;
  boldText?: boolean;
};

export default function AdminDashboardUser({
  user,
  buttonText,
  handleSubmit,
  clickable,
  boldText,
}: AdminDashboardUser) {
  const inner = (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          `flex h-16 w-16 cursor-pointer items-center justify-center rounded-full`,
          `bg-${user?.profileColor || ProfileColors.ProfileDefault}`,
        )}
      >
        <span className={`select-none text-xl font-bold text-black`}>
          {user?.lastName.charAt(0).toUpperCase() || "D"}
        </span>
      </div>
      <span
        className={`${cn({ "font-bold text-black": boldText })} flex flex-col`}
      >
        <div className="flex items-center gap-2">
          {user ? `${user.lastName} Family` : "Deleted User"}
          {user?.isAdmin && (
            <ShieldCheck
              className={`admin-icon h-7 w-7 fill-theme-gray text-white`}
            />
          )}
        </div>
        <span className="text-sm">{user?.email} </span>
      </span>
    </div>
  );

  return (
    <div className="mb-2 flex flex-wrap items-center justify-between border-b pb-5 align-middle text-xl">
      <div className="flex items-center gap-1">
        {clickable ? <Link href={`/family/${user?._id}`}>{inner}</Link> : inner}
        <Tooltip anchorSelect=".admin-icon" className="py-1 text-xs">
          Admin User
        </Tooltip>
      </div>
      <button
        className="h-[38px] rounded-md bg-[#EAEAEA] pl-4 pr-4 text-base font-bold text-theme-gray"
        onClick={(event) => {
          handleSubmit(event, user);
        }}
      >
        {buttonText}
      </button>
    </div>
  );
}
