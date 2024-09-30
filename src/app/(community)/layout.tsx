"use client"

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import CreatePostModal from "@/components/CreatePostModal";
import React, { useEffect, useRef, useState } from "react";
import Toaster, { notifySuccess, notifyFailure } from "@/components/Toaster"

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
        <CreatePostModal notifyFailure={notifyFailure} notifySuccess={notifySuccess} isOpen={isCreatePostModalOpen} openModal={openCreatePostModal} closeModal={closeCreatePostModal}/>
        <Sidebar />
        <div className="ml-[280px] mt-[100px] p-4">
          {children}
          <Toaster />
        </div>
      </body>
    </html>
  );
}