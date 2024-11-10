'use client';

import React, { useState, useEffect } from 'react';
import { Disability } from "@/utils/types/disability";
import { MAX_POST_DISABILITY_TAGS, MAX_FILTER_DISABILITY_TAGS } from "@/utils/consts";
import DropdownWithDisplay from '@/components/DropdownWithDisplay';
import { editUser, signOut } from "@/server/db/actions/UserActions";
import { useRouter } from 'next/navigation';
import { PostDeletionTimeline } from "@/utils/consts";
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { PopulatedUser } from '@/utils/types/user';
import BackButton from './BackButton';
import { getAuthenticatedUser } from '@/server/db/actions/AuthActions';


type SettingsProps = {
  user: PopulatedUser;
  disabilities: Array<Disability>;
};

export default function SettingsPage({ user, disabilities }: SettingsProps) {
  const { setUser } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const isFirstRender = React.useRef(true);

  const [notificationPreference, setNotificationPreference] = useState(user.notificationPreference);
  const [defaultDisabilityTags, setDefaultDisabilityTags] = useState<Disability[]>(user.defaultDisabilityTags);
  const [defaultDisabilityFilters, setDefaultDisabilityFilters] = useState<Disability[]>(user.defaultDisabilityFilters);
  const [postDeletionTimeline, setPostDeletionTimeline] = useState(user.postDeletionTimeline);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    const handleUpdateUser = async () => {
      try {
        await editUser(user._id, {
          notificationPreference: notificationPreference,
          defaultDisabilityTags: defaultDisabilityTags.map(disability => disability._id.toString()),
          defaultDisabilityFilters: defaultDisabilityFilters.map(disability => disability._id.toString()),
          postDeletionTimeline: postDeletionTimeline
        });
        const newUser = { ...user, notificationPreference, defaultDisabilityTags, defaultDisabilityFilters, postDeletionTimeline };
        setUser(newUser);
        getAuthenticatedUser(true);

        toast({
          title: "Update Success",
          description: "Your settings have been successfully updated.",
        });
      } catch (error) {
        toast({
          title: "Update Failed",
          description: "There was an error updating your settings. Please try again.",
        })
      }
    };

    handleUpdateUser();
  }, [notificationPreference, defaultDisabilityTags, defaultDisabilityFilters, postDeletionTimeline])

  const toggleDisability = (disability: Disability) => {
    const hasTag = defaultDisabilityTags.some(d => d._id.toString() === disability._id.toString());

    if (hasTag) {
      setDefaultDisabilityTags(defaultDisabilityTags.filter(d => d._id.toString() !== disability._id.toString()));
    } else if (defaultDisabilityTags.length < MAX_POST_DISABILITY_TAGS) {
      setDefaultDisabilityTags([...defaultDisabilityTags, disability]);
    }
  };

  const toggleFilter = (disability: Disability) => {
    const hasFilter = defaultDisabilityFilters.some(d => d._id.toString() === disability._id.toString());

    const newFilters = hasFilter
      ? defaultDisabilityFilters.filter(d => d._id.toString() !== disability._id.toString())
      : [...defaultDisabilityFilters, disability];
    
    setDefaultDisabilityFilters(newFilters);
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
      <main className="mx-20 flex flex-col px-16 space-y-6">
        <div className="text-black text-xl font-bold">Settings & Preferences</div>

        <div>
          <label htmlFor="title" className="block text-m font-bold text-black">Notification Preferences</label>
          <label className="block mt-2">
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
          <label className="block mt-2">
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
          <label htmlFor="title" className="block text-m font-bold text-black">Default Disability Tag on Create Post</label>
          <DropdownWithDisplay
            items={disabilities}
            selectedItems={defaultDisabilityTags}
            onToggleItem={toggleDisability}
            displayKey="name"
            placeholder="Select default disability tags"
            typeDropdown="disabilities"
            maxSelectionCount={MAX_POST_DISABILITY_TAGS}
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-m font-bold text-black">Default Disability Filter on Feed</label>
          <DropdownWithDisplay
            items={disabilities}
            selectedItems={defaultDisabilityFilters}
            onToggleItem={toggleFilter}
            displayKey="name"
            placeholder="Select default disability filters"
            maxSelectionCount={MAX_FILTER_DISABILITY_TAGS}
            typeDropdown="disabilities"
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-m font-bold text-black">Delete Posts After</label>
          {Object.values(PostDeletionTimeline).map((option) => (
            <label className="block mt-2" key={option}>
              <input
                type="radio"
                name="postDeletionTimeline"
                value={option}
                checked={postDeletionTimeline === option}
                onChange={() => setPostDeletionTimeline(option)}
                className="mr-2"
              />
              {option === PostDeletionTimeline.FourYears ? `${option} (default)` : option}
            </label>
          ))}
        </div>

        <div>
          <button
            onClick={async () => {
              await signOut();
              router.push('/login');
            }}
            className="w-auto px-4 py-2 text-theme-blue rounded-lg border border-theme-blue"
          >
            Sign out
          </button>
        </div>
      </main>
    </div>
  )
}
