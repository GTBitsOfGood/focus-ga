"use client";
import { ChevronLeft } from "lucide-react";
import { useRouter } from 'next/navigation';
import { Separator } from "@/components/ui/separator";
import { User } from "@/utils/types/user";
import { useEffect, useState } from "react";
import { getDisability } from "@/server/db/actions/DisabilityActions";
import Tag from "../Tag";

type ProfileContainerProps = {
  user: User;
}

export default function ProfileContainer({user}: ProfileContainerProps) {
  const router = useRouter();
  const [disabilities, setDisabilities] = useState<string[]>([]);
  console.log(user);

  useEffect(() => {
    const fetchDisabilities = async () => {
      try {
        const disabilitiesData = await Promise.all(
          user.childDisabilities.map(async (disability) => {
            const disabilityData = await getDisability(disability.toString());
            return disabilityData.name;
          })
        );
        setDisabilities(disabilitiesData);
      } catch (error) {
        console.error("Error fetching disabilities: ", error);
      }
    };
  
    fetchDisabilities();
  }, [user.childDisabilities]);

  const handleBack = () => {
    router.push("/");
  }

  return (
    <div className="mx-4 my-4">
      <div className="flex flex-row items-center hover:cursor-pointer" onClick={handleBack}>
        <ChevronLeft color="#636363" />
        <p className="text-focus-gray">Back</p>
      </div>
      <div className="mx-20 mt-8">
        <div className="flex flex-row mb-6 items-center">
          <div className="flex flex-col">
            <p className="text-2xl font-bold">{user.lastName} Household</p>
            <p className="text-lg font-normal">{user.email}</p>
          </div>
        </div>
        <div>
          <p className="text-lg mb-4">
            <span className="font-semibold">Location: </span>
            <span className="text-focus-gray">{user.city}, GA</span>
          </p>
          <div className="flex flex-row mb-4">
            <p className="text-lg font-semibold mr-3">Disabilities: </p>
            <div className="flex flex-row space-x-3">
              {
                disabilities.map((disability, index) => {
                  return <Tag text={disability} key={index} />
                })
              }
            </div>
          </div>
          <p className="font-semibold text-lg">Bio</p>
          <p className="text-lg text-focus-gray">{user.bio}</p>
        </div>
        <Separator className="bg-focus-gray my-6" />
      </div>
    </div>
  )
}