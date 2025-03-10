"use client";

import "@/app/globals.css";
import Navbar from "@/components/Navbar";
import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { Disability } from "@/utils/types/disability";
import { createPost, validatePost } from "@/server/db/actions/PostActions";
import { useToast } from "@/hooks/use-toast";
import EditPostModal from "@/components/EditPostModal";
import Image from "next/image";
import focusLogo from "../../../public/focus-logo.png";
import { DisabilityProvider } from "@/contexts/DisabilityContext";
import { useRouter } from "next/navigation";
import ProfanityModal from "@/components/ProfanityModal";

type LayoutProps = {
  children: React.ReactNode;
};

export default function ContextWrapper({ children }: LayoutProps) {
  return (
    <SearchProvider>
      <UserProvider>
        <DisabilityProvider>
          <CommunityLayout>{children}</CommunityLayout>
        </DisabilityProvider>
      </UserProvider>
    </SearchProvider>
  );
}

function CommunityLayout({ children }: LayoutProps) {
  const [isCreatePostModalOpen, setCreatePostModal] = useState(false);
  const [flaggedContentModal, setFlaggedContentModal] = useState(false);
  const [flaggedWords, setFlaggedWords] = useState<string[]>([]);
  const [tempFormattedData, setTempFormattedData] = useState<any>();

  const [childrenKey, setChildrenKey] = useState<number>(0);

  const openCreatePostModal = () => setCreatePostModal(true);
  const closeCreatePostModal = () => setCreatePostModal(false);
  const { toast } = useToast();
  const { user } = useUser();

  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [tags, setTags] = useState<Disability[]>([]);

  useEffect(() => {
    if (user) { 
      setTags(user.defaultDisabilityTags);
    } 
  }, [user])

  const router = useRouter();

  const notifySuccess = () => {
    toast({
      title: "Post successfully added",
      description: "Your post has been successfully added to the community.",
    });
  };

  const notifyFlaggedPost = () => {
    toast({
      title: "Review Submitted",
      description: "Your post has been submitted for admin review. You can check the status in “My Posts” under the Under Review section.",
    });
  }

  const notifyFailure = () => {
    toast({
      title: "Failed to add post",
      description: "There was an error adding your post. Please try again.",
    });
  };

  async function onPostSubmit(title: string, content: string, tags: Disability[], isPrivate: boolean) {
    if (!user) return;
    try {
      const formattedData = {
        author: user._id,
        title,
        content,
        tags: tags.map((tag) => tag._id),
        isPrivate
      };

      setTempFormattedData(formattedData);

      const flaggedWords = await validatePost(formattedData);

      if (flaggedWords.length > 0) {
        setFlaggedWords(flaggedWords);
        setFlaggedContentModal(true);
        setCreatePostModal(false);
      } else {
        await createPost(formattedData);
        notifySuccess();
        setCreatePostModal(false);
        setTitle("");
        setContent("");
        setChildrenKey(childrenKey + 1);
      }

    } catch (error) {
      notifyFailure();
      throw error;
    }
  }

  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <Image src={focusLogo} alt="focus logo" width={200} priority={true} />
        <p className="absolute bottom-16">
          Please{" "}
          <button
            className="font-bold text-theme-blue hover:underline"
            onClick={() => window.location.reload()}
          >
            refresh
          </button>{" "}
          this page if it does not load in 10 seconds
        </p>
      </div>
    );
  }

  const bannedView = (
    <div className="flex h-[calc(100vh-250px)] items-center justify-center text-center text-2xl font-bold text-theme-gray">
      This account has been banned from viewing any posts.
      <br />
      Please contact us if you believe this is a mistake.
    </div>
  );

  return (
    <>
      <Navbar openModal={openCreatePostModal} />
      <EditPostModal
        modalTitle="Create New Post"
        isOpen={isCreatePostModalOpen}
        openModal={openCreatePostModal}
        closeModal={closeCreatePostModal}
        onSubmit={onPostSubmit}
        tags={tags}
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
        setTags={setTags}
      />
      <ProfanityModal
        flaggedWords={flaggedWords}
        onCancel={() => {
          setFlaggedContentModal(false);
          setCreatePostModal(true);
        }}
        onSubmitReview={async () => {
          setFlaggedContentModal(false);
          await createPost(tempFormattedData);
          notifyFlaggedPost();
        }}
        isOpen={flaggedContentModal}
      />
      <div className="mt-24 sm:mt-32 p-4" key={childrenKey}>
        {user.isBanned ? bannedView : children}
        <Toaster />
      </div>
      <ProgressBar
        height="3px"
        color="#475CC6"
        shallowRouting
        options={{ showSpinner: false }}
      />
    </>
  );
}
