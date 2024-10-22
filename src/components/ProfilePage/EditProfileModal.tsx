'use client'

import React, { useEffect, useState, Suspense, useRef } from "react";
import { getDisabilities } from "@/server/db/actions/DisabilityActions";
import { Disability } from "@/utils/types/disability";
import Tag from "../Tag";
import dynamic from 'next/dynamic';
import { ChevronDown, Check, X, ChevronUp } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { cn } from "@/lib/utils";
import { GEORGIA_CITIES } from "@/utils/cities";
import { editUser } from "@/server/db/actions/UserActions";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";

const EditorComp = dynamic(() => import('../EditorComponent'), { ssr: false })

type EditProfileModalProps = {
  id: string;
  originalLocation: string;
  originalDisabilities: Disability[];
  originalBio: string | undefined;
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

type userData = {
  location: string;
  tags: Disability[];
  bio: string;
}

export default function EditProfileModal( props: EditProfileModalProps ) {
  const [userData, setUserData] = useState<userData>({
    location: "",
    tags: [],
    bio: "",
  });

  const [showLocations, setShowLocations] = useState(false);
  const [showLocationError, setLocationError] = useState(false);

  const [allDisabilities, setAllDisabilities] = useState<Disability[]>([]);
  const [originalDisabilities, setOriginalDisabilities] = useState<Disability[]>([]);
  const [showDisabilities, setShowDisabilities] = useState(false);
  const [showDisabilitiesError, setDisabilitiesError] = useState(false);

  const [mouseDownOnBackground, setMouseDownOnBackground] = useState(false);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editorRef = useRef<MDXEditorMethods | null>(null);

  useEffect(() => {
    const fetchDisabilities = async () => {
      const disabilityList = await getDisabilities();
      setAllDisabilities(disabilityList);
    }
    fetchDisabilities();
  }, []);

  useEffect(() => {
    const originalDisabilitiesData = allDisabilities.filter((disability) =>
      props.originalDisabilities.some(tag => tag._id.toString() === disability._id.toString())
    );
    setOriginalDisabilities(originalDisabilitiesData);
    setUserData({ location: props.originalLocation, tags: originalDisabilitiesData, bio: props.originalBio ? props.originalBio : "" });
  }, [props.originalLocation, props.originalDisabilities, props.originalBio, allDisabilities]);

  useEffect(() => {
    if (editorRef.current && props.isOpen) {
      editorRef.current.setMarkdown(props.originalBio ? props.originalBio : ""); 
    }
  }, [editorRef, props.isOpen])

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
  }

  const handleSubmit = async () => {
    try {
      if (validateSubmission()) {
        setIsSubmitting(true);
        const formattedData = {
          city: userData.location,
          childDisabilities: userData.tags.map((tag) => tag._id),
          bio: userData.bio.substring(0, 600),
        }

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
  }

  const handleClose = () => {
    props.closeModal();
    setLocationError(false);
    setDisabilitiesError(false);
    editorRef.current?.setMarkdown(props.originalBio ? props.originalBio : "");
    setUserData({ location: props.originalLocation, tags: originalDisabilities, bio: props.originalBio ? props.originalBio : "" });
  }

  const handleLocationSelect = (location: string) => {
    setShowLocations(false);
    setUserData({ ...userData, location: location });
  };

  const handleEditorChange = (text: string) => {
    setUserData({ ... userData, bio: text });
  }

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
    <div className={cn("fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50", { hidden: !props.isOpen })} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-5xl relative z-50 flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <div className="text-black text-xl font-bold">Edit Profile</div>
          <X className="w-6 h-6 cursor-pointer" onClick={handleClose} />
        </div>
        
        <div className="relative mb-6">
          <label htmlFor="location" className="block text-sm font-bold text-gray-700">
            Location
            <span className="text-error-red text-base font-medium">*</span>
          </label>
          <div className="relative w-full mt-1">
            <Popover open={showLocations} onOpenChange={setShowLocations}>
              <PopoverTrigger asChild className="w-full" onClick={() => setShowLocations(!showLocations)}>
                <div className={`relative flex items-center p-3 border ${showLocationError ? 'border-error-red' : 'border-gray-300'} rounded-md cursor-pointer`}>
                  <div className="flex items-center w-full h-6">
                    {userData.location ? (
                      <span className="text-black text-sm font-medium">{userData.location}</span>
                    ) : (
                      <div className="text-neutral-400 text-sm font-normal">
                        Search for location
                      </div>
                    )}
                  </div>
                  {showLocations ? (
                    <ChevronUp className="w-4 h-4" color="#7D7E82" />
                  ) : (
                    <ChevronDown className="w-4 h-4" color="#7D7E82" />
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
                        <CommandItem key={city} onSelect={() => {
                          handleLocationSelect(city)}
                        }
                        className={`flex items-center p-2 cursor-pointer rounded-lg hover:bg-gray-100 h-10`}>
                          {userData.location === city && (
                            <Check className="w-4 h-4 mr-2" color="#7D7E82" />
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

          {showLocationError ? <div className="text-error-red text-sm font-normal">Required Field</div> : null }
        </div>

        <div className="relative mb-6">
          <label htmlFor="tags" className="block text-sm font-bold text-gray-700">
            Disability Tags
            <span className="text-error-red text-base font-medium">*</span>
          </label>
          <div className="relative w-full mt-1">
            <Popover>
              <PopoverTrigger asChild className="w-full" onClick={() => setShowDisabilities(!showDisabilities)}>
                <div className={`relative flex items-center p-3 border ${showDisabilitiesError ? 'border-error-red' : 'border-gray-300'} rounded-md cursor-pointer`}>
                  <div className="flex items-center w-full h-6">
                    {userData.tags.length === 0 ? (
                      <div className="text-neutral-400 text-sm font-normal">
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
                          <Tag text={disability.name} isClickable={true} key={index} />
                        </div>
                      ))
                    )}
                  </div>

                  {showDisabilities ? <ChevronUp className="w-4 h-4" color="#7D7E82" /> : <ChevronDown className="w-4 h-4" color="#7D7E82" /> }

                </div>
                
              </PopoverTrigger>

              <PopoverContent align="start" className="max-h-40 overflow-y-auto p-2">
                {allDisabilities.map((disability) => ( 
                  <div key={disability._id} onClick={(e) => { e.stopPropagation(), toggleDisability(disability)} } className="w-full">
                    <li
                      key={disability._id}
                      onClick={(e) => { e.stopPropagation(), toggleDisability(disability)} }
                      className={`flex items-center p-2 cursor-pointer rounded-lg hover:bg-gray-100 h-10`}
                    >
                    {userData.tags.includes(disability) ? 
                    <Check className="w-4 h-4 mr-2" color="#7D7E82" />
                    : null}
                    {disability.name}
                    </li>
                  </div>
                ))}
              </PopoverContent>
            </Popover>
          </div>

          {showDisabilitiesError ? <div className="text-error-red text-sm font-normal">Required Field</div> : null }
        </div>
        
        <div className="relative mb-6">
          <label htmlFor="bio" className="block text-sm font-bold text-gray-700">
            Bio
          </label>
          <div className={`mt-1 rounded-lg h-full border`}>
            <Suspense fallback={null}>
              <EditorComp editorRef={editorRef} markdown={userData.bio} handleEditorChange={handleEditorChange} />
            </Suspense>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={handleClose}
            className="w-20 py-2 bg-light-gray text-theme-gray rounded-md hover:bg-zinc-300 font-bold"
          >
            Cancel
          </button>
          <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={cn(
            "min-w-20 py-2 px-4 bg-theme-blue rounded-lg justify-center items-center gap-2.5 inline-flex",
            {
            "opacity-50 cursor-not-allowed": isSubmitting,
            "hover:bg-blue-900": !isSubmitting,
            }
          )}
          >
          <div className="text-white font-bold">{isSubmitting ? 'Saving...' : 'Save'}</div>
          </button>
        </div>
      </div> 
    </div> 
  );
}