"use client";

import React, { useEffect, useState, Suspense, useRef } from "react";
import { Disability } from "@/utils/types/disability";
import Tag from "../Tag";
import dynamic from "next/dynamic";
import { ChevronDown, Check, X, ChevronUp } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { cn } from "@/lib/utils";
import { GEORGIA_CITIES } from "@/utils/cities";
import { editUser, resetUserData } from "@/server/db/actions/UserActions";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { useDisabilities } from "@/contexts/DisabilityContext";
import RedoSetupConfirmModal from "./RedoSetupConfirmModal";
import { useRouter } from "next/navigation";

const EditorComp = dynamic(() => import("../EditorComponent"), { ssr: false });

type EditProfileModalProps = {
  id: string;
  originalLocation: string;
  originalDisabilities: Disability[];
  originalBio: string | undefined;
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

type userData = {
  location: string;
  tags: Disability[];
  bio: string;
};

export default function EditProfileModal(props: EditProfileModalProps) {
  const [userData, setUserData] = useState<userData>({
    location: "",
    tags: [],
    bio: "",
  });

  const [showLocations, setShowLocations] = useState(false);
  const [showLocationError, setLocationError] = useState(false);

  const allDisabilities = useDisabilities();
  const [originalDisabilities, setOriginalDisabilities] = useState<
    Disability[]
  >([]);
  const [showDisabilities, setShowDisabilities] = useState(false);
  const [showDisabilitiesError, setDisabilitiesError] = useState(false);

  const [mouseDownOnBackground, setMouseDownOnBackground] = useState(false);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmationVisible, setConfirmationVisible] = useState(false);
  const editorRef = useRef<MDXEditorMethods | null>(null);
  const router = useRouter();
  useEffect(() => {
    const originalDisabilitiesData = allDisabilities.filter((disability) =>
      props.originalDisabilities.some(
        (tag) => tag._id.toString() === disability._id.toString(),
      ),
    );
    setOriginalDisabilities(originalDisabilitiesData);
    setUserData({
      location: props.originalLocation,
      tags: originalDisabilitiesData,
      bio: props.originalBio ? props.originalBio : "",
    });
  }, [
    props.originalLocation,
    props.originalDisabilities,
    props.originalBio,
    allDisabilities,
  ]);

  useEffect(() => {
    if (editorRef.current && props.isOpen) {
      editorRef.current.setMarkdown(props.originalBio ? props.originalBio : "");
    }
  }, [editorRef, props.isOpen]);

  const notifySuccess = () => {
    toast({
      title: "User profile successfully edited",
      description: "Your profile has been successfully edited.",
    });
  };

  const notifyFailure = () => {
    toast({
      title: "Failed to edit user profile",
      description: "There was an error editing your profile. Please try again.",
    });
  };

  const validateSubmission = (): boolean => {
    const isLocationValid = userData.location.length > 0;
    setLocationError(!isLocationValid);
    return isLocationValid;
  };

  const handleSubmit = async () => {
    try {
      if (validateSubmission()) {
        setIsSubmitting(true);
        const formattedData = {
          city: userData.location,
          childDisabilities: userData.tags.map((tag) => tag._id),
          bio: userData.bio,
        };

        await editUser(props.id, formattedData);
        props.closeModal();
        notifySuccess();

        editorRef.current?.setMarkdown("");
      }
    } catch (error) {
      notifyFailure();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    props.closeModal();
    setLocationError(false);
    setDisabilitiesError(false);
    editorRef.current?.setMarkdown(props.originalBio ? props.originalBio : "");
    setUserData({
      location: props.originalLocation,
      tags: originalDisabilities,
      bio: props.originalBio ? props.originalBio : "",
    });
  };

  const handleRedoSetup = () => {
    setConfirmationVisible(true);
  };

  const handleConfirmRedo = async () => {
    try {
      await resetUserData();
      setConfirmationVisible(false);
      router.push("/?setup=true");
    } catch (error) {
      console.error("Failed to reset user data");
    }
  };

  const handleCancelRedo = () => {
    setConfirmationVisible(false);
  };

  const handleLocationSelect = (location: string) => {
    setShowLocations(false);
    setUserData({ ...userData, location: location });
  };

  const handleEditorChange = (text: string) => {
    setUserData({ ...userData, bio: text });
  };

  const toggleDisability = (name: Disability) => {
    const newTags = userData.tags.includes(name)
      ? userData.tags.filter((d) => d !== name)
      : [...userData.tags, name];

    setUserData({ ...userData, tags: newTags });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setMouseDownOnBackground(true);
    } else {
      setMouseDownOnBackground(false);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mouseDownOnBackground && e.target === e.currentTarget) {
      handleClose();
    }
    setMouseDownOnBackground(false);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50",
        { hidden: !props.isOpen },
      )}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className="relative z-50 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xl font-bold text-black">Edit Profile</div>
          <X className="h-6 w-6 cursor-pointer" onClick={handleClose} />
        </div>

        <div className="relative mb-6">
          <label
            htmlFor="location"
            className="block text-sm font-bold text-gray-700"
          >
            Location
            <span className="text-base font-medium text-error-red">*</span>
          </label>
          <div className="relative mt-1 w-full">
            <Popover open={showLocations} onOpenChange={setShowLocations}>
              <PopoverTrigger
                asChild
                className="w-full"
                onClick={() => setShowLocations(!showLocations)}
              >
                <div
                  className={`relative flex items-center border p-3 ${showLocationError ? "border-error-red" : "border-gray-300"} cursor-pointer rounded-md`}
                >
                  <div className="flex h-6 w-full items-center">
                    {userData.location ? (
                      <span className="text-sm font-medium text-black">
                        {userData.location}
                      </span>
                    ) : (
                      <div className="text-sm font-normal text-neutral-400">
                        Search for location
                      </div>
                    )}
                  </div>
                  {showLocations ? (
                    <ChevronUp className="h-4 w-4" color="#7D7E82" />
                  ) : (
                    <ChevronDown className="h-4 w-4" color="#7D7E82" />
                  )}
                </div>
              </PopoverTrigger>

              <PopoverContent align="start" className="overflow-visible p-2">
                <Command>
                  <CommandInput placeholder="Search for location" />
                  <CommandList className="max-h-32 overflow-y-auto">
                    <CommandEmpty>No city found.</CommandEmpty>
                    <CommandGroup>
                      {GEORGIA_CITIES.map((city: string) => (
                        <CommandItem
                          key={city}
                          onSelect={() => {
                            handleLocationSelect(city);
                          }}
                          className={`flex h-10 cursor-pointer items-center rounded-lg p-2 hover:bg-gray-100`}
                        >
                          {userData.location === city && (
                            <Check className="mr-2 h-4 w-4" color="#7D7E82" />
                          )}
                          {city}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {showLocationError ? (
            <div className="text-sm font-normal text-error-red">
              Required Field
            </div>
          ) : null}
        </div>

        <div className="relative mb-6">
          <label
            htmlFor="tags"
            className="block text-sm font-bold text-gray-700"
          >
            Disability Tags
            <span className="text-base font-medium text-error-red">*</span>
          </label>
          <div className="relative mt-1 w-full">
            <Popover>
              <PopoverTrigger
                asChild
                className="w-full"
                onClick={() => setShowDisabilities(!showDisabilities)}
              >
                <div
                  className={`relative flex items-center border p-3 ${showDisabilitiesError ? "border-error-red" : "border-gray-300"} cursor-pointer rounded-md`}
                >
                  <div className="flex h-6 w-full items-center">
                    {userData.tags.length === 0 ? (
                      <div className="text-sm font-normal text-neutral-400">
                        Add disability tags
                      </div>
                    ) : (
                      userData.tags.map((disability, index) => (
                        <div
                          key={disability._id}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDisability(disability);
                          }}
                          className="mr-2"
                        >
                          <Tag
                            text={disability.name}
                            isClickable={true}
                            key={index}
                          />
                        </div>
                      ))
                    )}
                  </div>

                  {showDisabilities ? (
                    <ChevronUp className="h-4 w-4" color="#7D7E82" />
                  ) : (
                    <ChevronDown className="h-4 w-4" color="#7D7E82" />
                  )}
                </div>
              </PopoverTrigger>

              <PopoverContent
                align="start"
                className="max-h-40 overflow-y-auto p-2"
              >
                {allDisabilities.map((disability) => (
                  <div
                    key={disability._id}
                    onClick={(e) => {
                      e.stopPropagation(), toggleDisability(disability);
                    }}
                    className="w-full"
                  >
                    <li
                      key={disability._id}
                      onClick={(e) => {
                        e.stopPropagation(), toggleDisability(disability);
                      }}
                      className={`flex h-10 cursor-pointer items-center rounded-lg p-2 hover:bg-gray-100`}
                    >
                      {userData.tags.includes(disability) ? (
                        <Check className="mr-2 h-4 w-4" color="#7D7E82" />
                      ) : null}
                      {disability.name}
                    </li>
                  </div>
                ))}
              </PopoverContent>
            </Popover>
          </div>

          {showDisabilitiesError ? (
            <div className="text-sm font-normal text-error-red">
              Required Field
            </div>
          ) : null}
        </div>

        <div className="relative mb-6">
          <label
            htmlFor="bio"
            className="block text-sm font-bold text-gray-700"
          >
            Bio
          </label>
          <div className={`mt-1 h-full rounded-lg border`}>
            <Suspense fallback={null}>
              <EditorComp
                editorRef={editorRef}
                markdown={userData.bio}
                handleEditorChange={handleEditorChange}
                disableURL={true}
              />
            </Suspense>
          </div>
        </div>

        <div className="flex w-full items-center justify-between">
          <button
            onClick={handleRedoSetup}
            className="w-28 rounded-md bg-gray-300 py-2 font-bold text-gray-700 transition hover:bg-gray-400"
          >
            Redo Setup
          </button>
          <div className="flex space-x-4">
            <button
              onClick={handleClose}
              className="w-20 rounded-md bg-gray-300 py-2 font-bold text-gray-700 transition hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={cn(
                "inline-flex min-w-20 items-center justify-center gap-2.5 rounded-lg bg-theme-blue px-4 py-2",
                {
                  "cursor-not-allowed opacity-50": isSubmitting,
                  "transition hover:bg-blue-900": !isSubmitting,
                },
              )}
            >
              <div className="font-bold text-white">
                {isSubmitting ? "Saving..." : "Save"}
              </div>
            </button>
          </div>
        </div>
        {isConfirmationVisible && (
          <RedoSetupConfirmModal
            onConfirm={handleConfirmRedo}
            onCancel={handleCancelRedo}
          />
        )}
      </div>
    </div>
  );
}
