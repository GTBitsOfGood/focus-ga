"use client"

import "@/app/globals.css";
import Navbar from "@/components/Navbar";
import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster"
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { UserProvider, useUser } from "@/contexts/UserContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { Disability } from "@/utils/types/disability";
import { createPost } from "@/server/db/actions/PostActions";
import { useToast } from "@/hooks/use-toast";
import EditPostModal from "@/components/EditPostModal";
import Image from "next/image";
import focusLogo from "../../../public/focus-logo.png";
import { DisabilityProvider } from "@/contexts/DisabilityContext";

type LayoutProps = {
  children: React.ReactNode;
}

export default function ContextWrapper({ children }: LayoutProps) {
  return (
    <SearchProvider>
      <UserProvider>
        <DisabilityProvider>
          <CommunityLayout>
            {children}
          </CommunityLayout>
        </DisabilityProvider>
      </UserProvider>
    </SearchProvider>
  );
}

function CommunityLayout({ children }: LayoutProps) {
  const [isCreatePostModalOpen, setCreatePostModal] = useState(false);
  const openCreatePostModal = () => setCreatePostModal(true);
  const closeCreatePostModal = () => setCreatePostModal(false);
  const { toast } = useToast();
  const { user } = useUser();

  const notifySuccess = () => {
    toast({
      title: "Post successfully added",
      description: "Your post has been successfully added to the community.",
    });
  };

  const notifyFailure = () => {
    toast({
      title: "Failed to add post",
      description: "There was an error adding your post. Please try again.",
    });
  };

  async function onPostSubmit(title: string, content: string, tags: Disability[]) {
    if (!user) return;
    try {
      const formattedData = {
        author: user._id,
        title,
        content,
        tags: tags.map((tag) => tag._id)
      };
      await createPost(formattedData);
      notifySuccess();
    } catch (error) {
      notifyFailure();
      throw error;
    }
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Image src={focusLogo} alt="focus logo" width={200} priority={true} />
      </div>
    );
  }

  const bannedView = (
    <div className="h-[calc(100vh-250px)] flex items-center justify-center text-center text-2xl text-theme-gray font-bold">
      This account has been banned from viewing any posts.<br/>
      Please contact us if you believe this is a mistake.
    </div>
  );

  return (
    <>
      <Navbar openModal={openCreatePostModal}/>
      <EditPostModal
        modalTitle="Create New Post"
        isOpen={isCreatePostModalOpen}
        openModal={openCreatePostModal}
        closeModal={closeCreatePostModal}
        onSubmit={onPostSubmit}
        tags={user.defaultDisabilityTags}
      />
      <div className="mx-32 sm:mx-0 mt-[100px] p-4">
        {user.isBanned ? bannedView : children}
        <Toaster />
      </div>
      <ProgressBar height="3px" color="#475CC6" shallowRouting options={{ showSpinner: false }} />
    </>
  )
}
