'use client'

import React, { useRef, useEffect, useState, Suspense } from "react";
import { createPost } from "@/server/db/actions/PostActions";
import { getDisabilities } from "@/server/db/actions/DisabilityActions";
import { Disability } from "@/utils/types/disability";
import Tag from "./Tag";
import dynamic from 'next/dynamic'
import { MAX_POST_TITLE_LEN, MAX_POST_CONTENT_LEN, MAX_POST_DISABILITY_TAGS } from "@/utils/consts";
import { ChevronDown, Check, X, ChevronUp } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast";
import { Types } from "mongoose";

const EditorComp = dynamic(() => import('./EditorComponent'), { ssr: false })

type Props = {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

type PostData = {
  title: string;
  content: string;
  tags: Disability[];
}

export default function CreatePostModal( props: Props ) {
  const [postData, setPostData] = useState<PostData>({
    title: "",
    content: "",
    tags: []
  });
  const [showTitleError, setTitleError] = useState(false);
  const [showBodyError, setBodyError] = useState(false);
  const [showDisabilities, setShowDisabilities] = useState(false);
  const [disabilities, setDisabilities] = useState<Disability[]>([]);
  const [mouseDownOnBackground, setMouseDownOnBackground] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [dropdownWidth, setDropdownWidth] = useState<number | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    console.log(dropdownWidth)
    if (triggerRef.current) {
      setDropdownWidth(triggerRef.current.offsetWidth);
    }
  }, [triggerRef]);

  useEffect(() => {
    const fetchDisabilities = async () => {
      try {
        const disabilityList = await getDisabilities();
        setDisabilities(disabilityList);
      } catch (error) {
        console.error("failed to fetch disabilities")
      }
    }
    fetchDisabilities();
  }, [])

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
    if (postData.title.length == 0 && postData.content.length == 0) {
      setBodyError(true);
      setTitleError(true);
      return false;
    }
    if (postData.title.length == 0) {
      setTitleError(true);
      return false;
    } else {
      setTitleError(false);
    }
    if (postData.content.length == 0) {
      setBodyError(true);
      return false;
    } else {
      setTitleError(false);
    }
    return true;
  }

  const handleSubmit = async () => {
    try {
      if (validateSubmission()) {
        const formattedData = {
          author: (new Types.ObjectId()).toString(), // TODO: replace with actual userid 
          title: postData.title,
          content: postData.content.trim(),
          tags: postData.tags.map((tag) => tag._id)
        }

        console.log(formattedData.content)

        await createPost(formattedData);
        props.closeModal();
        notifySuccess();
        setPostData({
          title: "",
          content: "",
          tags: []
        });
      }
    } catch (error) {
      notifyFailure();
    }
  }

  const handleClose = () => {
    props.closeModal();
    setBodyError(false);
    setTitleError(false);
  }

  function countNonMarkdownCharacters(content: string): number {
    // Remove markdown-related characters such as formatting symbols for bold/italic/underline and lists
    const cleanedContent = content.replace(/(\*\*|__|\*|_|~~|`|\[.*?\]\(.*?\)|<.*?>|#|>|-|\+|\d+\.)/g, '')
                .replace(/\s+/g, '');
    return cleanedContent.length;
  }

  const handleEditorChange = (text: string) => {
    console.log(text)
    const textLength = countNonMarkdownCharacters(text);
    if (textLength <= MAX_POST_CONTENT_LEN) {
      setPostData({ ... postData, content: text });
    }
  }

  const toggleDisability = (name: Disability) => {
    if (postData.tags.length < MAX_POST_DISABILITY_TAGS) {
      const newTags = postData.tags.includes(name)
      ? postData.tags.filter((d) => d !== name)
      : [...postData.tags, name];
    
      setPostData({ ...postData, tags: newTags });
    } else if (postData.tags.length == MAX_POST_DISABILITY_TAGS) {
      const newTags = postData.tags.filter((d) => d !== name)
      setPostData({ ...postData, tags: newTags });
    }
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
    props.isOpen ? 
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-5xl h-full max-h-[70%] relative z-50 flex flex-col justify-between overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <div className="text-black text-xl font-bold">Create New Post</div>
          <X className="w-6 h-6 cursor-pointer" onClick={handleClose} />
        </div>
        
        <div className="relative mb-4">
          <label htmlFor="title" className="block text-sm font-bold text-gray-700">
            Title
            <span className="text-[#ff4e4e] text-base font-medium">*</span>
          </label>
          <div className={`w-full mt-1 p-3 border ${showTitleError ? 'border-[#ff4e4e]' : 'border-gray-300'} rounded-md flex justify-between items-center`}>
            <input
              id="title"
              value={postData.title}
              maxLength={100}
              placeholder="Enter post title"
              onChange={(event) => setPostData({ ...postData, title: event.target.value })}
              className="focus:outline-none w-[89%]"
            />
            <div className="text-gray-400 text-sm">
              {postData.title.length}/{MAX_POST_TITLE_LEN}
            </div>
          </div>
          
          {showTitleError ? <div className="text-[#ff4e4e] text-sm font-normal">Required Field</div> : null }
        </div>
        
        <div className="relative mb-4 h-[50%]">
          <label htmlFor="title" className="block text-sm font-bold text-gray-700">
            Body
            <span className="text-[#ff4e4e] text-base font-medium">*</span>
          </label>
          <div className={`mt-1 rounded-lg h-[85%] border ${showBodyError ? 'border-red-300 border-2' : ''}`}>
            <Suspense fallback={null}>
              <EditorComp markdown={postData.content} handleEditorChange={handleEditorChange} />
            </Suspense>
          </div>
          <div className="flex justify-between">
            {showBodyError ? <div className="text-[#ff4e4e] text-sm font-normal">Required Field</div> : <div></div> }
            <p className="text-sm text-gray-400 text-right">{countNonMarkdownCharacters(postData.content)}/{MAX_POST_CONTENT_LEN}</p>
          </div>
        </div>

        <div className="relative mb-4">
          <label htmlFor="title" className="block text-sm font-bold text-gray-700">
            Disability Tags
          </label>
          <div className="relative w-full">
            <Popover>
              <PopoverTrigger asChild className="w-full" onClick={() => {console.log("w"), setShowDisabilities(!showDisabilities)}}>
                <div className="relative flex items-center p-3 border border-gray-300 rounded-md cursor-pointer">
                  <div className="flex items-center w-full">
                    {postData.tags.length === 0 ? (
                      <div className="text-neutral-400 text-sm font-normal">
                      Add disability tags (up to five)
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

                  {showDisabilities ? <ChevronDown className="w-4 h-4" color="#7D7E82" /> : <ChevronUp className="w-4 h-4" color="#7D7E82" /> }

                </div>
                
              </PopoverTrigger>

              <PopoverContent align="start" className="max-h-40 overflow-y-auto p-2">
                {disabilities.map((disability) => (
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
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-bold"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            className="h-[38px] px-[25px] py-2 bg-[#475cc6] rounded-lg justify-center items-center gap-2.5 inline-flex">
            <div className="bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bold">Post</div>
          </button>
        </div>
      </div> 
    </div> 
    : null
  );
}