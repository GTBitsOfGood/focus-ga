"use client"

import Navbar from "@/components/Navbar";
import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster"
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { FOCUS_FONT } from "@/utils/consts";
import { useUser } from "@/hooks/user";
import { SearchProvider } from "@/hooks/SearchContext";
import { Disability } from "@/utils/types/disability";
import { createPost } from "@/server/db/actions/PostActions";
import { useToast } from "@/hooks/use-toast";
import EditPostModal from "@/components/EditPostModal";

type CommunityLayoutProps = {
  children: React.ReactNode;
}

export default function CommunityLayout({ children }: CommunityLayoutProps) {
  const [isCreatePostModalOpen, setCreatePostModal] = useState(false);
  const openCreatePostModal = () => setCreatePostModal(true);
  const closeCreatePostModal = () => setCreatePostModal(false);
  const user = useUser();
  const { toast } = useToast();

  if (!user) return null;

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
    <html lang='en'>
      <body className={FOCUS_FONT.className}>
        <SearchProvider>

        <Navbar openModal={openCreatePostModal} user={user}/>
          <EditPostModal
            modalTitle="Create New Post"
            isOpen={isCreatePostModalOpen}
            openModal={openCreatePostModal}
            closeModal={closeCreatePostModal}
            onSubmit={onPostSubmit}
          />
          <div className="mx-48 mt-[100px] p-4">
            {children}
            <Toaster />
          </div>
          <ProgressBar height="3px" color="#475CC6" shallowRouting options={{ showSpinner: false }} />
        </SearchProvider>
      </body>
    </html>
  );
}