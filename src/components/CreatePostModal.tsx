'use client'

import React, { useEffect, useState, Suspense, useRef } from "react";
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
import { MDXEditorMethods } from "@mdxeditor/editor";
import { cn, countNonMarkdownCharacters } from "@/lib/utils";
import { User } from "@/utils/types/user";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

const EditorComp = dynamic(() => import('./EditorComponent'), { ssr: false })

type CreatePostModalProps = {
  user: User;
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

type PostData = {
  title: string;
  content: string;
  tags: Disability[];
}

export default function CreatePostModal({user, isOpen, openModal, closeModal}: CreatePostModalProps) {
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
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editorRef = useRef<MDXEditorMethods | null>(null);

  useEffect(() => {
    const fetchDisabilities = async () => {
      const disabilityList = await getDisabilities();
      setDisabilities(disabilityList);
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
    const isTitleValid = postData.title.length > 0;
    const isContentValid = postData.content.length > 0;

    setTitleError(!isTitleValid);
    setBodyError(!isContentValid);

    return isTitleValid && isContentValid;
  }

  const handleSubmit = async () => {
    try {
      if (validateSubmission()) {
        setIsSubmitting(true);
        const formattedData = {
          author: user._id,
          title: postData.title,
          content: postData.content.trim(),
          tags: postData.tags.map((tag) => tag._id)
        }

        await createPost(formattedData);
        closeModal();
        notifySuccess();

        setPostData({
          title: "",
          content: "",
          tags: []
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
    closeModal();
    setBodyError(false);
    setTitleError(false);
  }

  const handleEditorChange = (text: string) => {
    const textLength = countNonMarkdownCharacters(text);
    if (textLength <= MAX_POST_CONTENT_LEN) {
      setPostData({ ... postData, content: text });
    } else {
      editorRef.current?.setMarkdown(postData.content);
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
    <div className={cn("fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50", { hidden: !isOpen })} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-5xl relative z-50 flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <div className="text-black text-xl font-bold">Create New Post</div>
          <X className="w-6 h-6 cursor-pointer" onClick={handleClose} />
        </div>
        
        <div className="relative mb-6">
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
        
        <div className="relative mb-6">
          <label htmlFor="title" className="block text-sm font-bold text-gray-700">
            Body
            <span className="text-[#ff4e4e] text-base font-medium">*</span>
          </label>
          <div className={`mt-1 rounded-lg h-full border ${showBodyError ? 'border-red-300 border-2' : ''}`}>
            <Suspense fallback={null}>
              <EditorComp editorRef={editorRef} markdown={postData.content} handleEditorChange={handleEditorChange} />
            </Suspense>
          </div>
          <div className="flex justify-between">
            {showBodyError ? <div className="text-[#ff4e4e] text-sm font-normal">Required Field</div> : <div></div> }
            <p className="text-sm text-gray-400 text-right">{countNonMarkdownCharacters(postData.content)}/{MAX_POST_CONTENT_LEN}</p>
          </div>
        </div>

        <div className="relative mb-6">
          <label htmlFor="title" className="block text-sm font-bold text-gray-700">
            Disability Tags
          </label>
          <div className="relative w-full mt-1">
            <Popover>
              <PopoverTrigger asChild className="w-full" onClick={() => setShowDisabilities(!showDisabilities)}>
                <div className="relative flex items-center p-3 border border-gray-300 rounded-md cursor-pointer">
                  <div className="flex items-center w-full h-6">
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

              <PopoverContent align="start" className="p-2">
                <Command>
                  <CommandInput placeholder={`Search disabilities`} />
                  <CommandList>
                    <CommandEmpty>No disability found.</CommandEmpty>
                    <CommandGroup>
                      {disabilities.map((d) => (
                        <CommandItem
                          key={d._id}
                          value={d.name}
                          onSelect={() => {
                            toggleDisability(d);
                          }}
                          className="flex items-center p-2 cursor-pointer rounded-lg hover:bg-gray-100 h-10"
                        >
                          { postData.tags.includes(d) ? 
                          <Check className="w-4 h-4 mr-2" color="#7D7E82" />
                          : null}
                          {d.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={handleClose}
            className="w-20 py-2 bg-gray-300 text-gray-700 rounded-md transition hover:bg-gray-400 font-bold"
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
            "transition hover:bg-blue-900": !isSubmitting,
            }
          )}
          >
          <div className="text-white font-bold">{isSubmitting ? 'Posting...' : 'Post'}</div>
          </button>
        </div>
      </div> 
    </div> 
  );
}