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

type LayoutProps = {
  children: React.ReactNode;
}

export default function ContextWrapper({ children }: LayoutProps) {
  return (
    <SearchProvider>
      <UserProvider>
        <CommunityLayout>
          {children}
        </CommunityLayout>
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

  return (
    <>
      <Navbar openModal={openCreatePostModal}/>
      <EditPostModal
        modalTitle="Create New Post"
        isOpen={isCreatePostModalOpen}
        openModal={openCreatePostModal}
        closeModal={closeCreatePostModal}
        onSubmit={onPostSubmit}
      />
      <div className="mx-32 sm:mx-0 mt-[100px] p-4">
        {children}
        <Toaster />
      </div>
      <ProgressBar height="3px" color="#475CC6" shallowRouting options={{ showSpinner: false }} />
    </>
  )
}
