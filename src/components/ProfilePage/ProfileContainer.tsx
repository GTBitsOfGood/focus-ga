"use client";
import { ChevronLeft } from "lucide-react";
import { useRouter } from 'next/navigation';
import { Separator } from "@/components/ui/separator";
import { User } from "@/utils/types/user";
import { useEffect } from "react";

type ProfileContainerProps = {
  user: User;
}

export default function ProfileContainer({user}: ProfileContainerProps) {
  const router = useRouter();
  console.log(user);

  useEffect(() => {
    // TODO: get disability objects for user's child disabilities
  }, []);

  const handleBack = () => {
    router.push("/");
  }

  return (
    <div className="mx-4 my-4">
      <div className="flex flex-row items-center hover:cursor-pointer" onClick={handleBack}>
        <ChevronLeft color="#636363" />
        <p className="text-focus-gray">Back</p>
      </div>
      <div className="mx-20">
        <div className="flex flex-row mb-6 items-center">
          <div className="flex flex-col">
            <p className="text-2xl font-bold">{user.lastName} Household</p>
            <p className="text-lg font-normal">{user.email}</p>
          </div>
        </div>
        <div>
          <p className="text-lg">
            <span className="font-semibold">Location: </span>
            <span className="text-focus-gray">{user.city}, GA</span>
          </p>
          <p className="text-lg">
            <span className="font-semibold">Disabilities: </span>
            <span className="text-focus-gray">info</span>
          </p>
          <p className="font-semibold text-lg">Bio</p>
          <p className="text-lg text-focus-gray">{user.bio}</p>
        </div>
        <Separator className="bg-focus-gray my-6" />
      </div>
    </div>
  )
}