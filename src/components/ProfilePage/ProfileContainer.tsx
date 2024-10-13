"use client";

import { ChevronLeft, Pencil } from "lucide-react";
import { useRouter } from 'next/navigation';
import { Separator } from "@/components/ui/separator";
import { User } from "@/utils/types/user";
import { useEffect, useState } from "react";
import { getDisability } from "@/server/db/actions/DisabilityActions";
import Tag from "../Tag";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPopulatedUserPosts } from "@/server/db/actions/PostActions";
import { PopulatedPost } from "@/utils/types/post";
import PostComponent from "../PostComponent";
import EditProfileModal from "./EditProfileModal";


type ProfileContainerProps = {
  user: User;
}

export default function ProfileContainer({user}: ProfileContainerProps) {
  const router = useRouter();
  const [disabilities, setDisabilities] = useState<string[]>([]);
  const [userPosts, setUserPosts] = useState<PopulatedPost[]>([]);
  const CURR_USER = user._id;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  console.log(user);

  useEffect(() => {
    const fetchDisabilities = async () => {
      if (!user || !user._id) {
        return;
      }

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

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user || !user._id) {
        return;
      }
      setUserPosts(await getPopulatedUserPosts(user._id));
    };

    fetchUserPosts(); 
  }, [user._id]);

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
        <div className="flex flex-row mb-6 items-center justify-between">
          <div className="flex flex-col">
            <p className="text-2xl font-bold">{user.lastName} Household</p>
            <p className="text-lg font-normal">{user.email}</p>
          </div>
          {
            CURR_USER === user._id 
            ? (
              <button onClick={() => setIsModalOpen(true)} className="bg-[#EAEAEA] text-focus-gray text-lg font-bold px-4 py-2 rounded-lg">
                <div className="flex flex-row items-center space-x-1.5">
                  <Pencil color="#636363" className="w-6 h-6" />
                  <p>Edit</p>
                </div>
              </button>
            )
            : null
          }
        </div>
        <EditProfileModal isOpen={isModalOpen} openModal={openModal} closeModal={closeModal} />
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
        <Tabs defaultValue="my-posts">
          <TabsList>
            <TabsTrigger value="my-posts">My Posts</TabsTrigger>
            <TabsTrigger value="saved-posts">Saved Posts</TabsTrigger>
          </TabsList>
          <TabsContent value="my-posts">
            {
              userPosts.map((post) => {
                return <PostComponent key={post._id} post={post} clickable={true} />
              })
            }
          </TabsContent>
          <TabsContent value="saved-posts">Saved posts here.</TabsContent>
        </Tabs>
      </div>
    </div>
  )
}