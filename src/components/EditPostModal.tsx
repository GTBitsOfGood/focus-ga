"use client";

import React, { useEffect, useState, Suspense, useRef } from "react";
import { Disability } from "@/utils/types/disability";
import dynamic from "next/dynamic";
import {
  MAX_POST_TITLE_LEN,
  MAX_POST_CONTENT_LEN,
  MAX_POST_DISABILITY_TAGS,
} from "@/utils/consts";
import { X } from "lucide-react";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { cn, countNonMarkdownCharacters } from "@/lib/utils";
import DropdownWithDisplay from "./DropdownWithDisplay";
import { useDisabilities } from "@/contexts/DisabilityContext";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

const EditorComp = dynamic(() => import("./EditorComponent"), { ssr: false });

type EditPostModalProps = {
  isOpen: boolean;
  openModal?: () => void;
  closeModal: () => void;
  modalTitle?: string;
  title?: string;
  content?: string;
  tags?: Disability[];
  isPrivate?: boolean;
  onSubmit: (
    title: string,
    content: string,
    tags: Disability[],
  ) => Promise<void>;
};

export default function EditPostModal(props: EditPostModalProps) {
  const {
    isOpen,
    openModal,
    closeModal,
    modalTitle = "Edit Post",
    title: initialTitle,
    content: initialContent,
    tags: initialTags,
    isPrivate: initialIsPrivate,
    onSubmit,
  } = props;

  const [title, setTitle] = useState<string>(initialTitle || "");
  const [content, setContent] = useState<string>(initialContent || "");
  const [tags, setTags] = useState<Disability[]>(initialTags || []);
  const [showTitleError, setTitleError] = useState(false);
  const [showBodyError, setBodyError] = useState(false);
  const disabilities = useDisabilities();
  const [isPrivate, setIsPrivate] = useState<boolean | undefined>(initialIsPrivate);
  const [mouseDownOnBackground, setMouseDownOnBackground] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editorRef = useRef<MDXEditorMethods | null>(null);
  const { user } = useUser();

  const handleSubmit = async () => {
    try {
      if (validateSubmission()) {
        setIsSubmitting(true);
        await onSubmit(title, content, tags);
        closeModal();
        editorRef.current?.setMarkdown("");
      }
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateSubmission = (): boolean => {
    const isTitleValid = title.length > 0;
    const isContentValid = content.length > 0;

    setTitleError(!isTitleValid);
    setBodyError(!isContentValid);

    return isTitleValid && isContentValid;
  };

  const handleClose = () => {
    closeModal();
    setBodyError(false);
    setTitleError(false);
  };

  const handleEditorChange = (text: string) => {
    const textLength = countNonMarkdownCharacters(text);
    if (textLength <= MAX_POST_CONTENT_LEN) {
      setContent(text);
    } else {
      editorRef.current?.setMarkdown(content);
    }
  };

  const toggleDisability = (disability: Disability) => {
    const hasTag = tags.some(
      (d) => d._id.toString() === disability._id.toString(),
    );

    if (hasTag) {
      setTags(
        tags.filter((d) => d._id.toString() !== disability._id.toString()),
      );
    } else if (tags.length < MAX_POST_DISABILITY_TAGS) {
      setTags([...tags, disability]);
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

  useEffect(() => {
    if (!user) return;

    setTags(user.defaultDisabilityTags);
  }, [user]);

  if (!isOpen) {
    return <></>;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className="relative z-50 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xl font-bold text-black">{modalTitle}</div>
          <X className="h-6 w-6 cursor-pointer" onClick={handleClose} />
        </div>

        <div className="relative mb-6">
          <label
            htmlFor="title"
            className="block text-sm font-bold text-gray-700"
          >
            Title
            <span className="text-base font-medium text-error-red">*</span>
          </label>
          <div
            className={`mt-1 w-full border p-3 ${showTitleError ? "border-error-red" : "border-gray-300"} flex items-center justify-between rounded-md`}
          >
            <input
              id="title"
              value={title}
              maxLength={100}
              placeholder="Enter post title"
              onChange={(event) => setTitle(event.target.value)}
              className="w-[89%] focus:outline-none"
            />
            <div className="text-sm text-gray-400">
              {title.length}/{MAX_POST_TITLE_LEN}
            </div>
          </div>

          {showTitleError ? (
            <div className="text-sm font-normal text-error-red">
              Required Field
            </div>
          ) : null}
        </div>

        <div className="relative mb-6">
          <label
            htmlFor="title"
            className="block text-sm font-bold text-gray-700"
          >
            Body
            <span className="text-base font-medium text-error-red">*</span>
          </label>
          <div
            className={`mt-1 h-full rounded-lg border ${showBodyError ? "border-2 border-red-300" : ""}`}
          >
            <Suspense fallback={null}>
              <EditorComp
                editorRef={editorRef}
                markdown={content}
                handleEditorChange={handleEditorChange}
              />
            </Suspense>
          </div>
          <div className="flex justify-between">
            {showBodyError ? (
              <div className="text-sm font-normal text-error-red">
                Required Field
              </div>
            ) : (
              <div></div>
            )}
            <p className="text-right text-sm text-gray-400">
              {countNonMarkdownCharacters(content)}/{MAX_POST_CONTENT_LEN}
            </p>
          </div>
        </div>

        <div className="relative mb-6">
          <label
            htmlFor="title"
            className="block text-sm font-bold text-gray-700"
          >
            Disability Tags
          </label>
          <DropdownWithDisplay
            items={disabilities}
            selectedItems={tags}
            onChange={(items) => setTags(items)}
            displayKey="name"
            placeholder="Add disability tags"
            maxSelectionCount={5}
            typeDropdown="disabilities"
          />
        </div>

        <div className="relative mb-6">
          <label
            htmlFor="title"
            className="block text-sm text-gray-700 mb-2"
          >
            Make your post <span className="font-bold">public</span> or <span className="font-bold">private</span>
          </label>
          <form className="flex flex-col items-start border-[1px] border-theme-medlight-gray rounded-[8px] p-[16px] gap-[16px]">
            <label className="flex gap-2">
              <div>
                <input type="radio" className="border-theme-medlight-gray"/>
              </div>
              <div>
                Private
                <br></br>
                <span className="text-[#A3A3A3] font-[400]">Only you and FOCUS admin can see your post</span>
              </div>
            </label>
            <label className="flex gap-2">
              <div>
                <input type="radio" className="border-theme-medlight-gray"/>
              </div>
              <div>
                Public
                <br></br>
                <span className="text-[#A3A3A3] font-[400]">Everyone in FOCUS group can see your post</span>
              </div>
            </label>
          </form>
        </div>

        <div className="flex justify-end space-x-4">
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
              {isSubmitting ? "Posting..." : "Post"}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
