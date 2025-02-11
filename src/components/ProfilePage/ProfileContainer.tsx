"use client";

import { Ban, Pencil, ShieldCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { PopulatedUser } from "@/utils/types/user";
import { useEffect, useState } from "react";
import Tag from "../Tag";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPopulatedSavedPosts, getPopulatedUserPosts } from "@/server/db/actions/PostActions";
import { PopulatedPost } from "@/utils/types/post";
import PostComponent from "../PostComponent";
import EditProfileModal from "./EditProfileModal";
import ColorPicker from "../ColorPicker";
import { ProfileColors } from "@/utils/consts";
import { editUser } from "@/server/db/actions/UserActions";
import { useUser } from "@/contexts/UserContext";
import BackButton from "../BackButton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Tooltip } from "react-tooltip";


type ProfileContainerProps = {
  user: PopulatedUser;
}

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
      setUserPosts(await getPopulatedUserPosts(user._id));
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
  }

  const handleBanClick = async () => {
    if (banLoading) return;
    setBanLoading(true);
    try {
      await editUser(user._id, { isBanned: !isBanned });
      setIsBanned(isBanned => !isBanned);
      setShowBanDialog(false);
    } finally {
      setBanLoading(false);
    }
  }

  if (!currUser) {
    return;
  }

  return (
    <div>
      <div className="mx-16 my-4 text-lg text-theme-gray">
        <BackButton />
      </div>
      <div className="mx-16 my-4">
        <div className="mx-14 mt-8">
          <div className="flex flex-row mb-6 items-start justify-between">
            <div className="flex flex-row space-x-6">
              <div className={`flex items-center justify-center w-[108px] h-[108px] rounded-full bg-${user.profileColor} relative`}> 
                <span className="text-6xl select-none font-medium text-black">{user.lastName.charAt(0).toUpperCase()}</span>
                { user._id === currUser._id && <ColorPicker handleColorPick = {handleColorPick} /> }
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold">{user.lastName} Family</p>
                  { user.isAdmin && (
                      <>
                        <ShieldCheck className="admin-icon-profile w-8 h-8 text-white fill-theme-gray" />
                        <Tooltip anchorSelect=".admin-icon-profile" className="text-xs py-1">Admin User</Tooltip>
                      </>
                    )
                  }
                </div>
                <p className="text-lg font-normal">{user.email}</p>
              </div>
            </div>
            {
              user._id === currUser._id
              ? (
                <button onClick={() => setIsModalOpen(true)} className="bg-light-gray hover:bg-zinc-300 transition text-theme-gray text-lg font-bold px-4 py-2 rounded-lg">
                  <div className="flex flex-row items-center space-x-2.5">
                    <Pencil color="#636363" className="w-6 h-6" />
                    <p>Edit</p>
                  </div>
                </button>
              ) : currUser.isAdmin && (
                <button onClick={() => setShowBanDialog(true)} className={`'bg-light-gray ${isBanned ? 'hover:bg-theme-gray hover:text-gray-200' : 'hover:bg-zinc-300'} transition text-theme-gray text-lg font-bold px-4 py-2 rounded-lg`}>
                  <div className="flex flex-row items-center space-x-2.5">
                    <Ban className="w-6 h-6" />
                    <p>{user.isBanned ? 'Unban User' : 'Ban User'}</p>
                  </div>
                </button>
              )
            }
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
                <AlertDialogTitle>{isBanned ? 'Unban User' : 'Ban User'}</AlertDialogTitle>
                <AlertDialogDescription>
                  {
                    isBanned
                      ? 'Are you sure you want to unban this user?'
                      : 'Are you sure you want to ban this user? They would not be able to view any future posts.'
                  }
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowBanDialog(false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={banLoading}
                  onClick={handleBanClick}
                  className="bg-theme-blue hover:bg-theme-blue hover:opacity-90 transition"
                >
                  {
                    isBanned
                      ? (banLoading ? 'Unbanning...' : 'Unban')
                      : (banLoading ? 'Banning...' : 'Ban')
                  }
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div>
            <p className="text-lg mb-4">
              <span className="font-semibold">Location: </span>
              <span className="text-theme-gray ml-1">{user.city}, GA</span>
            </p>
            <div className="flex flex-row mb-4">
              <p className="text-lg font-semibold mr-3">Disabilities: </p>
              <div className={`flex flex-row flex-wrap gap-3 ${user.childDisabilities.length > 0 ? 'py-1' : '-my-1'}`}>
                {
                  user.childDisabilities.map((disability, index) => {
                    return <Tag text={disability.name} key={index} />
                  })
                }
              </div>
              {user.childDisabilities.length == 0 ? <p className="text-lg text-theme-gray -ml-1">N/A</p> : <></>}
            </div>
            <div className="flex flex-row gap-2">
              {user.bio ? <p className="font-semibold text-lg">Bio:</p> : <></>}
              <p className="text-lg text-theme-gray break-words overflow-hidden">{user.bio}</p>
            </div>
          </div>
          <Separator className="bg-theme-gray my-6" />
          <Tabs defaultValue="my-posts">
            <TabsList className="mb-4">
              <TabsTrigger value="my-posts">{user._id === currUser._id ? 'My Posts' : 'Posts'}</TabsTrigger>
              {user._id === currUser._id && <TabsTrigger value="saved-posts">Saved Posts</TabsTrigger>}
            </TabsList>
            <TabsContent value="my-posts">
              <div className="space-y-6">
              {userPosts.length === 0 ? <p className="text-lg text-theme-gray mt-12 mx-auto w-fit place-self-center">No posts to view</p> : <></>}
                {
                  userPosts.map((post) => {
                    return <PostComponent key={post._id} post={post} clickable={true} />
                  })
                }
              </div>
            </TabsContent>
            <TabsContent value="saved-posts">
              <div className="space-y-6">
              {savedPosts.length === 0 ? <p className="text-lg text-theme-gray mt-12 mx-auto w-fit place-self-center">No saved posts to view</p> : <></>}
                {
                  savedPosts.map((post) => {
                    return <PostComponent key={post._id} post={post} clickable={true} />
                  })
                }
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}