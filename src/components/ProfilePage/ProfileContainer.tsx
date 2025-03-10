"use client";

import { Ban, Pencil, ShieldCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { PopulatedUser } from "@/utils/types/user";
import { useEffect, useState } from "react";
import Tag from "../Tag";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getPopulatedSavedPosts,
  getPopulatedUserPosts,
} from "@/server/db/actions/PostActions";
import { PopulatedPost } from "@/utils/types/post";
import PostComponent from "../PostComponent";
import EditProfileModal from "./EditProfileModal";
import ColorPicker from "../ColorPicker";
import { ProfileColors } from "@/utils/consts";
import { editUser } from "@/server/db/actions/UserActions";
import { useUser } from "@/contexts/UserContext";
import BackButton from "../BackButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Tooltip } from "react-tooltip";

type ProfileContainerProps = {
  user: PopulatedUser;
};

export default function ProfileContainer({ user }: ProfileContainerProps) {
  const [userPosts, setUserPosts] = useState<PopulatedPost[]>([]);
  const [savedPosts, setSavedPosts] = useState<PopulatedPost[]>([]);
  const [isBanned, setIsBanned] = useState<boolean>(user.isBanned);
  const [showBanDialog, setShowBanDialog] = useState<boolean>(false);
  const [banLoading, setBanLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user: currUser, setUser } = useUser();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    const fetchUserPosts = async () => {
      setUserPosts(
        await getPopulatedUserPosts(user._id, currUser?._id, currUser?.isAdmin),
      );
    };
    const fetchSavedPosts = async () => {
      setSavedPosts(await getPopulatedSavedPosts(user._id, user.isAdmin));
    };

    if (user) {
      fetchUserPosts();
      fetchSavedPosts();
    }
  }, [user]);

  const handleColorPick = async (color: ProfileColors) => {
    if (!currUser) {
      return;
    }
    try {
      const updatedUser = await editUser(currUser._id, { profileColor: color });
      setUser({ ...currUser, profileColor: color });
    } catch (error) {
      console.error("Failed to update profile color: ", error);
    }
  };

  const handleBanClick = async () => {
    if (banLoading) return;
    setBanLoading(true);
    try {
      await editUser(user._id, { isBanned: !isBanned });
      setIsBanned((isBanned) => !isBanned);
      setShowBanDialog(false);
    } finally {
      setBanLoading(false);
    }
  };

  if (!currUser) {
    return;
  }

  return (
    <div>
      <div className="mx-16 my-4 text-lg text-theme-gray">
        <BackButton />
      </div>
      <div className="sm:mx-16 my-4">
        <div className="sm:mx-14 mt-8">
          <div className="mb-6 flex flex-row items-start justify-between">
            <div className="flex flex-row space-x-6">
              <div
                className={`h-24 w-24 items-center justify-center rounded-full bg-${user.profileColor} relative hidden sm:flex`}
              >
                <span className="select-none text-6xl font-medium text-black">
                  {user.lastName.charAt(0).toUpperCase()}
                </span>
                {user._id === currUser._id && (
                  <ColorPicker handleColorPick={handleColorPick} />
                )}
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold break-words">{user.lastName} Family</p>
                  {user.isAdmin && (
                    <>
                      <ShieldCheck className="admin-icon-profile h-8 w-8 fill-theme-gray text-white" />
                      <Tooltip
                        anchorSelect=".admin-icon-profile"
                        className="py-1 text-xs"
                      >
                        Admin User
                      </Tooltip>
                    </>
                  )}
                </div>
                <p className="text-lg font-normal break-words">{user.email}</p>
              </div>
            </div>
            {user._id === currUser._id ? (
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-light-gray rounded-lg px-4 py-2 text-lg font-bold text-theme-gray transition hover:bg-zinc-300"
              >
                <div className="flex flex-row items-center space-x-2.5 sm:inline-flex hidden">
                  <Pencil color="#636363" className="h-6 w-6" />
                  <p>Edit</p>
                </div>
              </button>
            ) : (
              currUser.isAdmin && (
                <button
                  onClick={() => setShowBanDialog(true)}
                  className={`'bg-light-gray ${isBanned ? "hover:bg-theme-gray hover:text-gray-200" : "hover:bg-zinc-300"} rounded-lg px-4 py-2 text-lg font-bold text-theme-gray transition`}
                >
                  <div className="flex flex-row items-center space-x-2.5">
                    <Ban className="h-6 w-6" />
                    <p>{user.isBanned ? "Unban User" : "Ban User"}</p>
                  </div>
                </button>
              )
            )}
          </div>
          <EditProfileModal
            id={user._id}
            originalLocation={user.city}
            originalDisabilities={user.childDisabilities}
            originalBio={user.bio}
            isOpen={isModalOpen}
            openModal={openModal}
            closeModal={closeModal}
          />
          <AlertDialog open={showBanDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {isBanned ? "Unban User" : "Ban User"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {isBanned
                    ? "Are you sure you want to unban this user?"
                    : "Are you sure you want to ban this user? They would not be able to view any future posts."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowBanDialog(false)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={banLoading}
                  onClick={handleBanClick}
                  className="bg-theme-blue transition hover:bg-theme-blue hover:opacity-90"
                >
                  {isBanned
                    ? banLoading
                      ? "Unbanning..."
                      : "Unban"
                    : banLoading
                      ? "Banning..."
                      : "Ban"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div>
            <p className="mb-4 text-lg">
              <span className="font-semibold">Location: </span>
              <span className="ml-1 text-theme-gray">{user.city}, GA</span>
            </p>
            <div className="mb-4 flex flex-row">
              <p className="mr-3 text-lg font-semibold">Disabilities: </p>
              <div
                className={`flex flex-row flex-wrap gap-3 ${user.childDisabilities.length > 0 ? "py-1" : "-my-1"}`}
              >
                {user.childDisabilities.map((disability, index) => {
                  return <Tag text={disability.name} key={index} />;
                })}
              </div>
              {user.childDisabilities.length == 0 ? (
                <p className="-ml-1 text-lg text-theme-gray">N/A</p>
              ) : (
                <></>
              )}
            </div>
            <div className="flex flex-row gap-2">
              {user.bio ? <p className="text-lg font-semibold">Bio:</p> : <></>}
              <p className="overflow-hidden break-words text-lg text-theme-gray">
                {user.bio}
              </p>
            </div>
          </div>
          <Separator className="my-6 bg-theme-gray" />
          <Tabs defaultValue="my-posts">
            <TabsList className="mb-4">
              <TabsTrigger size="large" value="my-posts">
                {user._id === currUser._id ? "My Posts" : "Posts"}
              </TabsTrigger>
              {user._id === currUser._id && (
                <TabsTrigger size="large" value="saved-posts">
                  Saved Posts
                </TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="my-posts">
              <div className="space-y-6">
                {userPosts.length === 0 ? (
                  <p className="mx-auto mt-12 w-fit place-self-center text-lg text-theme-gray">
                    No posts to view
                  </p>
                ) : (
                  <></>
                )}
                {[...userPosts].reverse().map((post) => {
                  return (
                    <PostComponent
                      key={post._id}
                      post={post}
                      clickable={true}
                    />
                  );
                })}
              </div>
            </TabsContent>
            <TabsContent value="saved-posts">
              <div className="space-y-6">
                {savedPosts.length === 0 ? (
                  <p className="mx-auto mt-12 w-fit place-self-center text-lg text-theme-gray">
                    No saved posts to view
                  </p>
                ) : (
                  <></>
                )}
                {savedPosts.map((post) => {
                  return (
                    <PostComponent
                      key={post._id}
                      post={post}
                      clickable={true}
                    />
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
