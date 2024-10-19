"use client";

import { ChevronLeftIcon, Pencil } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { User } from "@/utils/types/user";
import { useEffect, useState } from "react";
import { getDisabilities, getDisability } from "@/server/db/actions/DisabilityActions";
import Tag from "../Tag";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPopulatedUserPosts } from "@/server/db/actions/PostActions";
import { PopulatedPost } from "@/utils/types/post";
import PostComponent from "../PostComponent";
import EditProfileModal from "./EditProfileModal";
import Link from "next/link";
import { Disability } from "@/utils/types/disability";


type ProfileContainerProps = {
  user: User;
}

export default function ProfileContainer({user}: ProfileContainerProps) {
  const [disabilities, setDisabilities] = useState<Disability[]>([]);
  const [disabilityNames, setDisabilityNames] = useState<string[]>([]);
  const [userPosts, setUserPosts] = useState<PopulatedPost[]>([]);
  const CURR_USER = user._id;
  const [lastInitial, setLastInitial] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    const fetchDisabilities = async () => {
      try {
        const disabilitiesData = await Promise.all(
          user.childDisabilities.map(async (disabilityId) => {
            return await getDisability(disabilityId.toString());
          })
        );
        
        const disabilityNames = disabilitiesData.map(disability => disability.name);
        
        setDisabilities(disabilitiesData);
        setDisabilityNames(disabilityNames);
      } catch (error) {
        console.error("Error fetching disabilities: ", error);
      }
    };

    const fetchUserPosts = async () => {
      setUserPosts(await getPopulatedUserPosts(user._id));
    };

    if (user) {
      fetchDisabilities();
      fetchUserPosts(); 
      setLastInitial(user.lastName[0]);
    }
  }, [user]);

  return (
    <div>
    <div className="mx-16 my-4 text-lg text-focus-gray">
        <Link href={'/'} className="flex items-center gap-1">
          <ChevronLeftIcon className="w-6 h-6" /> Back
        </Link>
      </div>
    <div className="mx-16 my-4">
      <div className="mx-20 mt-8">
        <div className="flex flex-row mb-6 items-start justify-between">
          <div className="flex flex-row space-x-6">
            <div className="flex items-center justify-center w-[108px] h-[108px] rounded-full bg-profile-pink">
              <span className="text-6xl font-medium text-black">{lastInitial}</span>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-2xl font-bold">{user.lastName} Household</p>
              <p className="text-lg font-normal">{user.email}</p>
            </div>
          </div>
          {
            CURR_USER === user._id 
            ? (
              <button onClick={() => setIsModalOpen(true)} className="bg-light-gray hover:bg-zinc-300 text-focus-gray text-lg font-bold px-4 py-2 rounded-lg">
                <div className="flex flex-row items-center space-x-2.5">
                  <Pencil color="#636363" className="w-6 h-6" />
                  <p>Edit</p>
                </div>
              </button>
            )
            : null
          }
        </div>
        <EditProfileModal
          id={user._id}
          originalLocation={user.city}
          originalDisabilities={disabilities}
          originalBio={user.bio}
          isOpen={isModalOpen}
          openModal={openModal}
          closeModal={closeModal}
        />
        <div>
          <p className="text-lg mb-4">
            <span className="font-semibold">Location: </span>
            <span className="text-focus-gray">{user.city}, GA</span>
          </p>
          <div className="flex flex-row mb-4">
            <p className="text-lg font-semibold mr-3">Disabilities: </p>
            <div className={`flex flex-row gap-2 flex-wrap gap-3 ${disabilityNames.length > 0 ? 'py-1' : '-my-1'}`}>
              {
                disabilityNames.map((disability, index) => {
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
          <TabsList className="mb-4">
            <TabsTrigger value="my-posts">My Posts</TabsTrigger>
            <TabsTrigger value="saved-posts">Saved Posts</TabsTrigger>
          </TabsList>
          <TabsContent value="my-posts">
            <div className="space-y-6">
              {
                userPosts.map((post) => {
                  return <PostComponent key={post._id} post={post} clickable={true} />
                })
              }
            </div>
          </TabsContent>
          <TabsContent value="saved-posts">Saved posts here.</TabsContent>
        </Tabs>
      </div>
    </div>
    </div>
  )
}