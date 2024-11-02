"use client"

import Navbar from "@/components/Navbar";
import CreatePostModal from "@/components/CreatePostModal";
import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster"
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { FOCUS_FONT } from "@/utils/consts";
import { useUser } from "@/hooks/user";

type CommunityLayoutProps = {
  children: React.ReactNode;
}

export default function CommunityLayout({ children }: CommunityLayoutProps) {
  const [isCreatePostModalOpen, setCreatePostModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const openCreatePostModal = () => setCreatePostModal(true);
  const closeCreatePostModal = () => setCreatePostModal(false);
  const user = useUser();

  if (!user) return null;

  return (
    <html lang='en'>
      <body className={FOCUS_FONT.className}>
        <Navbar openModal={openCreatePostModal} setSearchTerm={setSearchTerm}  user={user}/>
        <CreatePostModal isOpen={isCreatePostModalOpen} openModal={openCreatePostModal} closeModal={closeCreatePostModal} user={user}/>
        <div className="mx-48 mt-[100px] p-4">
          {children}
          <Toaster />
        </div>
        <ProgressBar height="3px" color="#475CC6" shallowRouting options={{ showSpinner: false }} />
      </body>
    </html>
  );
}