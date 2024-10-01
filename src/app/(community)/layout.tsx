"use client"

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import CreatePostModal from "@/components/CreatePostModal";
import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster"
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import config from "../../../tailwind.config";

type CommunityLayoutProps = {
  children: React.ReactNode;
}

export default function CommunityLayout({ children }: CommunityLayoutProps) {
  const [isCreatePostModalOpen, setCreatePostModal] = useState(false);
  const openCreatePostModal = () => setCreatePostModal(true);
  const closeCreatePostModal = () => setCreatePostModal(false);

  return (
    <html lang='en'>
      <body>
        <Navbar openModal={openCreatePostModal}/>
        <CreatePostModal isOpen={isCreatePostModalOpen} openModal={openCreatePostModal} closeModal={closeCreatePostModal}/>
        <Sidebar />
        <div className="ml-[280px] mt-[100px] p-4">
          {children}
          <Toaster />
        </div>
        <ProgressBar height="3px" color="#475CC6" shallowRouting options={{ showSpinner: false }} />
      </body>
    </html>
  );
}