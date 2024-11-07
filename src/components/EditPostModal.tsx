'use client'

import React, { useEffect, useState, Suspense, useRef } from "react";
import { Disability } from "@/utils/types/disability";
import dynamic from 'next/dynamic'
import { MAX_POST_TITLE_LEN, MAX_POST_CONTENT_LEN, MAX_POST_DISABILITY_TAGS } from "@/utils/consts";
import { X } from "lucide-react";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { cn, countNonMarkdownCharacters } from "@/lib/utils";
import DropdownWithDisplay from "./DropdownWithDisplay";
import { useDisabilities } from "@/contexts/DisabilityContext";

const EditorComp = dynamic(() => import('./EditorComponent'), { ssr: false })

type EditPostModalProps = {
  isOpen: boolean;
  openModal?: () => void;
  closeModal: () => void;
  modalTitle?: string;
  title?: string;
  content?: string;
  tags?: Disability[];
  onSubmit: (title: string, content: string, tags: Disability[]) => Promise<void>;
}

export default function EditPostModal(props: EditPostModalProps) {
  const {
    isOpen,
    openModal,
    closeModal,
    modalTitle = "Edit Post",
    title: initialTitle,
    content: initialContent,
    tags: initialTags,
    onSubmit
  } = props;

  const [title, setTitle] = useState<string>(initialTitle || "");
  const [content, setContent] = useState<string>(initialContent || "");
  const [tags, setTags] = useState<Disability[]>(initialTags || []);
  const [showTitleError, setTitleError] = useState(false);
  const [showBodyError, setBodyError] = useState(false);
  const disabilities = useDisabilities();
  const [mouseDownOnBackground, setMouseDownOnBackground] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editorRef = useRef<MDXEditorMethods | null>(null);

  const handleSubmit = async () => {
    try {
      if (validateSubmission()) {
        setIsSubmitting(true);
        await onSubmit(title, content, tags);
        closeModal();
        editorRef.current?.setMarkdown("");
      }
    } catch (error) {} finally {
      setIsSubmitting(false);
    }
  }

  const validateSubmission = (): boolean => {
    const isTitleValid = title.length > 0;
    const isContentValid = content.length > 0;

    setTitleError(!isTitleValid);
    setBodyError(!isContentValid);

    return isTitleValid && isContentValid;
  }

  const handleClose = () => {
    closeModal();
    setBodyError(false);
    setTitleError(false);
  }

  const handleEditorChange = (text: string) => {
    const textLength = countNonMarkdownCharacters(text);
    if (textLength <= MAX_POST_CONTENT_LEN) {
      setContent(text);
    } else {
      editorRef.current?.setMarkdown(content);
    }
  }

  const toggleDisability = (name: Disability) => {
    if (tags.length < MAX_POST_DISABILITY_TAGS) {
      const newTags = tags.includes(name)
      ? tags.filter((d) => d !== name)
      : [...tags, name];
    
      setTags(newTags);
    } else if (tags.length == MAX_POST_DISABILITY_TAGS) {
      const newTags = tags.filter((d) => d !== name)
      setTags(newTags);
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

  if (!isOpen) {
    return <></>
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-5xl relative z-50 flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <div className="text-black text-xl font-bold">{modalTitle}</div>
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
              value={title}
              maxLength={100}
              placeholder="Enter post title"
              onChange={(event) => setTitle(event.target.value)}
              className="focus:outline-none w-[89%]"
            />
            <div className="text-gray-400 text-sm">
              {title.length}/{MAX_POST_TITLE_LEN}
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
              <EditorComp editorRef={editorRef} markdown={content} handleEditorChange={handleEditorChange} />
            </Suspense>
          </div>
          <div className="flex justify-between">
            {showBodyError ? <div className="text-[#ff4e4e] text-sm font-normal">Required Field</div> : <div></div> }
            <p className="text-sm text-gray-400 text-right">{countNonMarkdownCharacters(content)}/{MAX_POST_CONTENT_LEN}</p>
          </div>
        </div>

        <div className="relative mb-6">
          <label htmlFor="title" className="block text-sm font-bold text-gray-700">
            Disability Tags
          </label>
          <DropdownWithDisplay
            items = {disabilities}
            selectedItems={tags}
            onToggleItem={toggleDisability}
            displayKey="name"
            placeholder="Add disability tags"
            maxSelectionCount={5}
            typeDropdown="disabilities"
          />
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