"use client";

import React, { useState, useEffect } from "react";
import { Disability } from "@/utils/types/disability";
import {
  MAX_POST_DISABILITY_TAGS,
  MAX_FILTER_DISABILITY_TAGS,
  PostDeletionDurations,
} from "@/utils/consts";
import DropdownWithDisplay from "@/components/DropdownWithDisplay";
import { editUser } from "@/server/db/actions/UserActions";
import { signOut } from "@/server/db/actions/AuthActions";
import { useRouter } from "next/navigation";
import { PostDeletionTimeline } from "@/utils/consts";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { PopulatedUser } from "@/utils/types/user";
import BackButton from "./BackButton";
import { getAuthenticatedUser } from "@/server/db/actions/AuthActions";
import ConfirmationDialog from "./ConfirmationDialog";

type SettingsProps = {
  user: PopulatedUser;
  disabilities: Array<Disability>;
};

export default function SettingsPage({ user, disabilities }: SettingsProps) {
  const { setUser } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const isFirstRender = React.useRef(true);

  const [notificationPreference, setNotificationPreference] = useState(
    user.notificationPreference,
  );
  const [defaultDisabilityTags, setDefaultDisabilityTags] = useState<
    Disability[]
  >(user.defaultDisabilityTags);
  const [defaultDisabilityFilters, setDefaultDisabilityFilters] = useState<
    Disability[]
  >(user.defaultDisabilityFilters);
  const [postDeletionTimeline, setPostDeletionTimeline] = useState(
    user.postDeletionTimeline,
  );
  const [isAdmin, setIsAdmin] = useState(user.isAdmin);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [changeLoading, setChangeLoading] = useState<boolean>(false);
  const [selectedTimeline, setSelectedTimeline] =
    useState<PostDeletionTimeline>(user.postDeletionTimeline);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const handleUpdateUser = async () => {
      try {
        await editUser(user._id, {
          notificationPreference: notificationPreference,
          defaultDisabilityTags: defaultDisabilityTags.map((disability) =>
            disability._id.toString(),
          ),
          defaultDisabilityFilters: defaultDisabilityFilters.map((disability) =>
            disability._id.toString(),
          ),
          postDeletionTimeline: postDeletionTimeline,
          isAdmin,
        });
        const newUser = {
          ...user,
          notificationPreference,
          defaultDisabilityTags,
          defaultDisabilityFilters,
          postDeletionTimeline,
        };
        setUser(newUser);
        getAuthenticatedUser(true);

        toast({
          title: "Update Success",
          description: "Your settings have been successfully updated.",
        });
      } catch (error) {
        toast({
          title: "Update Failed",
          description:
            "There was an error updating your settings. Please try again.",
        });
      }
    };

    handleUpdateUser();
  }, [
    notificationPreference,
    defaultDisabilityTags,
    defaultDisabilityFilters,
    postDeletionTimeline,
    isAdmin,
  ]);

  const handleTimelineChange = async (option: PostDeletionTimeline) => {
    setSelectedTimeline(option);
    if (
      PostDeletionDurations[option] <
        PostDeletionDurations[postDeletionTimeline] &&
      !showConfirmDialog
    ) {
      setShowConfirmDialog(true);
    } else {
      await confirmTimelineChange(option);
    }
  };

  const confirmTimelineChange = async (option: PostDeletionTimeline) => {
    setPostDeletionTimeline(option);
    setShowConfirmDialog(false);
    await editUser(user._id, { postDeletionTimeline: option });
  };

  return (
    <div>
      {/* for rendering dynamic classes: https://www.reddit.com/r/sveltejs/comments/1b3u9d2/tailwind_colors_not_working/ */}
      <div className="hidden">
        <div className="bg-profile-pink"></div>
        <div className="bg-profile-orange"></div>
        <div className="bg-profile-yellow"></div>
        <div className="bg-profile-green"></div>
        <div className="bg-profile-teal"></div>
        <div className="bg-profile-indigo"></div>
      </div>

      <div className="mx-16 my-4 text-lg text-theme-gray">
        <BackButton />
      </div>
      <main className="flex flex-col space-y-6 px-16 sm:mx-20">
        <div className="text-xl font-bold text-black">
          Settings & Preferences
        </div>

        <div>
          <label htmlFor="title" className="text-m block font-bold text-black">
            Notification Preferences
          </label>
          <label className="mt-2 block">
            <input
              type="radio"
              name="notificationPreference"
              value="never"
              checked={notificationPreference === false}
              onChange={() => setNotificationPreference(false)}
              className="mr-2"
            />
            Never email
          </label>
          <label className="mt-2 block">
            <input
              type="radio"
              name="notificationPreference"
              value="email"
              checked={notificationPreference === true}
              onChange={() => setNotificationPreference(true)}
              className="mr-2"
            />
            Email about post replies
          </label>
        </div>

        <div>
          <label htmlFor="title" className="text-m block font-bold text-black">
            Set a default disability tag to attach to your posts
          </label>
          <DropdownWithDisplay
            items={disabilities}
            selectedItems={defaultDisabilityTags}
            onChange={(tags) => setDefaultDisabilityTags(tags)}
            displayKey="name"
            placeholder="Select default disability tags"
            typeDropdown="disabilities"
            maxSelectionCount={MAX_POST_DISABILITY_TAGS}
          />
        </div>

        <div>
          <label htmlFor="title" className="text-m block font-bold text-black">
            Set a default disability tag filter for your main feed
          </label>
          <DropdownWithDisplay
            items={disabilities}
            selectedItems={defaultDisabilityFilters}
            onChange={(filters) => setDefaultDisabilityFilters(filters)}
            displayKey="name"
            placeholder="Select default disability filters"
            maxSelectionCount={MAX_FILTER_DISABILITY_TAGS}
            typeDropdown="disabilities"
          />
        </div>

        <div>
          <label htmlFor="title" className="text-m block font-bold text-black">
            Delete Posts After
          </label>
          {Object.values(PostDeletionTimeline).map((option) => (
            <label className="mt-2 block" key={option}>
              <input
                type="radio"
                name="postDeletionTimeline"
                value={option}
                checked={postDeletionTimeline === option}
                onChange={() => handleTimelineChange(option)}
                className="mr-2"
              />
              {option === PostDeletionTimeline.FourYears
                ? `${option} (default)`
                : option}
            </label>
          ))}
        </div>
        {/* DEV PURPOSES: Admin status change */}
        <div>
          <label htmlFor="title" className="text-m block font-bold text-black">
            **Dev** Set Admin Status
          </label>
          <label className="mt-2 block">
            <input
              type="radio"
              name="isAdmin"
              value="false"
              checked={isAdmin === false}
              onChange={() => {
                setIsAdmin(false);
                window.location.reload();
              }}
              className="mr-2"
            />
            Member
          </label>
          <label className="mt-2 block">
            <input
              type="radio"
              name="isAdmin"
              value="true"
              checked={isAdmin === true}
              onChange={() => {
                setIsAdmin(true);
                window.location.reload();
              }}
              className="mr-2"
            />
            Admin
          </label>
        </div>
        <div>
          <button
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
            className="mb-8 w-auto rounded-md border border-theme-blue px-4 py-2 text-theme-blue transition hover:bg-blue-100"
          >
            Sign out
          </button>
        </div>
      </main>
      {showConfirmDialog && (
        <ConfirmationDialog
          handleCancel={() => {
            setShowConfirmDialog(false);
          }}
          loading={changeLoading}
          handleConfirm={() => confirmTimelineChange(selectedTimeline)}
          type="changeDeletionTimeline"
          duration={selectedTimeline}
        />
      )}
    </div>
  );
}
