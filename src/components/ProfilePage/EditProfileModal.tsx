'use client'

import React, { useEffect, useState, Suspense, useRef } from "react";
import { getDisabilities, getDisability } from "@/server/db/actions/DisabilityActions";
import { Disability } from "@/utils/types/disability";
import Tag from "../Tag";
import dynamic from 'next/dynamic'
import { MAX_POST_CONTENT_LEN } from "@/utils/consts";
import { ChevronDown, Check, X, ChevronUp } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { cn, countNonMarkdownCharacters } from "@/lib/utils";
import { cities } from "@/utils/cities";
import { editUser } from "@/server/db/actions/UserActions";

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

type PostData = {
  location: string;
  tags: Disability[];
  bio: string;
}

export default function CreatePostModal( props: EditProfileModalProps ) {
  const [postData, setPostData] = useState<PostData>({
    location: "",
    tags: [],
    bio: "",
  });

  const [selectedLocation, setSelectedLocation] = useState("");
  const [showLocations, setShowLocations] = useState(false);
  const [showLocationError, setLocationError] = useState(false);

  const [selectedDisabilities, setSelectedDisabilities] = useState<Disability[]>([]);
  const [showDisabilities, setShowDisabilities] = useState(false);
  const [showDisabilitiesError, setDisabilitiesError] = useState(false);

  const [mouseDownOnBackground, setMouseDownOnBackground] = useState(false);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editorRef = useRef<MDXEditorMethods | null>(null);

  useEffect(() => {
    const fetchDisabilities = async () => {
      const disabilityList = await getDisabilities();
      setSelectedDisabilities(disabilityList);
    }
    fetchDisabilities();
    setSelectedLocation(props.originalLocation);
    setSelectedDisabilities(props.originalDisabilities);
    console.log(props.originalBio);
  }, [])

  useEffect(() => {
    if (editorRef.current && props.isOpen) {
      editorRef.current.setMarkdown(props.originalBio ? props.originalBio : ""); 
    }
  }, [editorRef, props.isOpen])

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

  const validateSubmission = (): boolean => {
    const isLocationValid = postData.location.length > 0;

    setLocationError(!isLocationValid);

    return isLocationValid;
  }

  const handleSubmit = async () => {
    try {
      if (validateSubmission()) {
        setIsSubmitting(true);
        const formattedData = {
          city: postData.location,
          childDisabilities: postData.tags.map((tag) => tag._id),
          bio: postData.bio,
        }

        await editUser(props.id, formattedData);
        props.closeModal();
        notifySuccess();

        setPostData({
          location: "",
          tags: [],
          bio: "",
        });
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
    setSelectedLocation(props.originalLocation);
    setSelectedDisabilities(props.originalDisabilities);
    editorRef.current?.setMarkdown(props.originalBio ? props.originalBio : "");
  }

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setShowLocations(false);
    setPostData({ ...postData, location: location });
  };

  const handleEditorChange = (text: string) => {
    const textLength = countNonMarkdownCharacters(text);
    if (textLength <= MAX_POST_CONTENT_LEN) {
      setPostData({ ... postData, bio: text });
    } else {
      editorRef.current?.setMarkdown(postData.bio);
    }
  }

  const toggleDisability = (name: Disability) => {
    const newTags = postData.tags.includes(name)
    ? postData.tags.filter((d) => d !== name)
    : [...postData.tags, name];
  
    setPostData({ ...postData, tags: newTags });
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
            <Popover>
              <PopoverTrigger asChild className="w-full" onClick={() => setShowLocations(!showLocations)}>
                <div className={`relative flex items-center p-3 border ${showLocationError ? 'border-error-red' : 'border-gray-300'} rounded-md cursor-pointer`}>
                  <div className="flex items-center w-full h-6">
                    {selectedLocation ? (
                      <span className="text-black text-sm font-medium">{selectedLocation}</span>
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

              <PopoverContent align="start" className="max-h-40 overflow-y-auto p-2">
                {cities.map((city) => (
                  <div key={city} onClick={(e) => e.stopPropagation()} className="w-full">
                    <li
                      onClick={() => handleLocationSelect(city)} 
                      className={`flex items-center p-2 cursor-pointer rounded-lg hover:bg-gray-100 h-10`}
                    >
                      {selectedLocation === city && ( 
                        <Check className="w-4 h-4 mr-2" color="#7D7E82" />
                      )}
                      {city}
                    </li>
                  </div>
                ))}
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
                    {postData.tags.length === 0 ? (
                      <div className="text-neutral-400 text-sm font-normal">
                      Add disability tags
                      </div>
                    ) : (
                      postData.tags.map((disability) => (
                      <div
                        key={disability._id}
                        onClick={(e) => {
                        e.stopPropagation();
                        toggleDisability(disability);
                        }}
                        className="mr-2"
                      >
                        <Tag text={disability.name} isClickable={true}/>
                      </div>
                      ))
                    )}
                  </div>

                  {showDisabilities ? <ChevronUp className="w-4 h-4" color="#7D7E82" /> : <ChevronDown className="w-4 h-4" color="#7D7E82" /> }

                </div>
                
              </PopoverTrigger>

              <PopoverContent align="start" className="max-h-40 overflow-y-auto p-2">
                {selectedDisabilities.map((disability) => ( // TODO: what happened here
                  <div key={disability._id} onClick={(e) => { e.stopPropagation(), toggleDisability(disability)} } className="w-full">
                    <li
                      key={disability._id}
                      onClick={(e) => { e.stopPropagation(), toggleDisability(disability)} }
                      className={`flex items-center p-2 cursor-pointer rounded-lg hover:bg-gray-100 h-10`}
                    >
                    { postData.tags.includes(disability) ? 
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
              <EditorComp editorRef={editorRef} markdown={postData.bio} handleEditorChange={handleEditorChange} />
            </Suspense>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={handleClose}
            className="w-20 py-2 bg-light-gray text-focus-gray rounded-md hover:bg-zinc-300 font-bold"
          >
            Cancel
          </button>
          <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={cn(
            "min-w-20 py-2 px-4 bg-blue rounded-lg justify-center items-center gap-2.5 inline-flex",
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