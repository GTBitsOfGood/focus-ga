'use client'

import React, { useState, useEffect } from 'react';
import { Disability } from "@/utils/types/disability";
import { getDisabilities } from "@/server/db/actions/DisabilityActions";
import { MAX_POST_DISABILITY_TAGS, MAX_FILTER_DISABILITY_TAGS } from "@/utils/consts";
import DropdownWithDisplay from '@/components/DropdownWithDisplay';
import { editUser, getPopulatedUser, signOut } from "@/server/db/actions/UserActions";
import { useRouter } from 'next/navigation';
import { PostDeletionTimeline } from "@/utils/consts";
import Link from "next/link";
import { ChevronLeftIcon } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

export default function SettingsPage() {
    const { user, setUser } = useUser();
    const router = useRouter();

    const [disabilities, setDisabilities] = useState<Disability[]>([]);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [notificationPreference, setNotificationPreference] = useState(true);
    const [defaultDisabilityTags, setDefaultDisabilityTags] = useState<Disability[]>([]);
    const [defaultDisabilityFilters, setDefaultDisabilityFilters] = useState<Disability[]>([]);
    const [postDeletionTimeline, setPostDeletionTimeline] = useState(PostDeletionTimeline.FourYears);

    useEffect(() => {
        const fetchDisabilities = async () => {
          const disabilityList = await getDisabilities();
          setDisabilities(disabilityList);
        }
        const fetchUserData = async () => {
            if (!user) {
                return null;
            }
            try {
                const populatedUser = getPopulatedUser(user._id);
                setNotificationPreference(user.notificationPreference);
                setPostDeletionTimeline(user.postDeletionTimeline);
                setDefaultDisabilityTags((await populatedUser).defaultDisabilityTags);
                setDefaultDisabilityFilters((await populatedUser).defaultDisabilityFilters);
                setIsInitialLoad(false);
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            }
        }
        fetchDisabilities();
        fetchUserData();
    }, []);

    useEffect(() => {
        const handleUpdateUser = async () => {
            if (isInitialLoad || !user) {
                return
            }
            try {
                const updatedUser = await editUser(user._id, {
                    notificationPreference: notificationPreference,
                    defaultDisabilityTags: defaultDisabilityTags.map(disability => disability._id.toString()),
                    defaultDisabilityFilters: defaultDisabilityFilters.map(disability => disability._id.toString()),
                    postDeletionTimeline: postDeletionTimeline
                });
                setUser(updatedUser);
            } catch (error) {
                console.error("Failed to update user:", error);
            }
        };

        handleUpdateUser();
    }, [notificationPreference, defaultDisabilityTags, defaultDisabilityFilters, postDeletionTimeline])

    const toggleDisability = (name: Disability) => {
        if (defaultDisabilityTags.length < MAX_POST_DISABILITY_TAGS) {
          const newTags = defaultDisabilityTags.includes(name)
          ? defaultDisabilityTags.filter((d) => d !== name)
          : [...defaultDisabilityTags, name];
        
          setDefaultDisabilityTags(newTags);
        } else if (defaultDisabilityTags.length == MAX_POST_DISABILITY_TAGS) {
          const newTags = defaultDisabilityTags.filter((d) => d !== name)
          setDefaultDisabilityTags(newTags);
        }
    };

    const toggleFilter = (name: Disability) => {
        const newFilters = defaultDisabilityFilters.includes(name)
          ? defaultDisabilityFilters.filter((d) => d !== name)
          : [...defaultDisabilityFilters, name];
        
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
                <Link href={'/'} className="flex items-center gap-1 w-min p-2">
                    <ChevronLeftIcon className="w-6 h-6" /> Back
                </Link>
            </div>
            <main className="flex flex-col px-16 space-y-6">
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