import { ProfileColors } from "@/utils/consts";
import { PopulatedUser, User } from "@/utils/types/user";
import { cn } from "@/lib/utils";
import Link from "next/link";

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
        {user ? `${user.lastName} Family` : 'Deleted User'}
      </span>
    </div>
  );

  return clickable ? (
    inner
  ) : (
    <Link href={`/family/${user?._id}`}>
      {inner}
    </Link>
  );
}