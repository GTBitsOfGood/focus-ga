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
import { marked, Renderer } from "marked";
import { useRouter, usePathname } from "next/navigation";

const EditorComp = dynamic(() => import("./EditorComponent"), { ssr: false });

type EditPostModalProps = {
  isOpen: boolean;
  openModal?: () => void;
  closeModal: () => void;
  modalTitle?: string;
  title: string;
  content: string;
  tags: Disability[];
  isPrivate?: boolean;
  editedByAdmin?: boolean | undefined;
  onSubmit: (
    title: string,
    content: string,
    tags: Disability[],
    isPrivate: boolean,
    editedByAdmin: boolean | undefined,
  ) => Promise<void>;
  setTitle : any;
  setContent : any;
  setTags: any
};

export default function EditPostModal(props: EditPostModalProps) {
  const {
    isOpen,
    openModal,
    closeModal,
    modalTitle = "Edit Post",
    title,
    content,
    tags,
    isPrivate: initialIsPrivate,
    editedByAdmin: initialEditedByAdmin,
    onSubmit,
    setTitle,
    setContent,
    setTags
  } = props;

  
  const [showTitleError, setTitleError] = useState(false);
  const [showBodyError, setBodyError] = useState(false);
  const disabilities = useDisabilities();
  const [isPrivate, setIsPrivate] = useState<boolean>(
    initialIsPrivate || false,
  );
  const [mouseDownOnBackground, setMouseDownOnBackground] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editorRef = useRef<MDXEditorMethods | null>(null);
  const { user } = useUser();
  const [editedByAdmin] = useState<boolean | undefined>(initialEditedByAdmin);
  const router = useRouter();
  const pathname = usePathname();

  const handleSubmit = async () => {
    try {
      if (validateSubmission()) {
        setIsSubmitting(true);
        const isAdmin = user?.isAdmin;
        await onSubmit(
          title,
          content,
          tags,
          isPrivate,
          isAdmin || editedByAdmin,
        );
        // closeModal();
        // window.location.reload();
        // editorRef.current?.setMarkdown("");  
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

  const renderer = new Renderer();
  renderer.link = ({ href, text }: { href: string; text: string }): string => {
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  };
  const processMarkdownLinks = async (markdown: string): Promise<string> => {
    return marked(markdown, { renderer });
  };

  const handleEditorChange = async (text: string) => {
    const textLength = countNonMarkdownCharacters(text);
    if (textLength <= MAX_POST_CONTENT_LEN) {
      const processedContent = await processMarkdownLinks(text);
      setContent(processedContent);
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
          <X
            className="h-6 w-6 cursor-pointer"
            onClick={(e) => {
              handleClose();
              e.stopPropagation();
            }}
          />
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
          <label htmlFor="title" className="mb-2 block text-sm text-gray-700">
            Make your post <span className="font-bold">public</span> or{" "}
            <span className="font-bold">private</span>
          </label>
            <form className="flex flex-col items-start gap-2 rounded-lg border border-theme-medlight-gray p-4">
              <label className="flex gap-2">
                <div>
                  <input
                    type="radio"
                    className="border-theme-medlight-gray"
                    id="editPrivate"
                    checked={isPrivate}
                    onChange={() => {
                      setIsPrivate(true);
                    }}
                    name="postVisibility"
                  />
                </div>
                <div>
                  Private
                  <br></br>
                  <span className="font-[400] text-[#A3A3A3]">
                    Only you and FOCUS admin can see your post
                  </span>
                </div>
              </label>
              <label className="flex gap-2">
                <div>
                  <input
                    type="radio"
                    className="border-theme-medlight-gray"
                    id="editPublic"
                    checked={!isPrivate}
                    onChange={() => {
                      setIsPrivate(false);
                    }}
                    name="postVisibility"
                  />
                </div>
                <div>
                  Public
                  <br></br>
                  <span className="font-[400] text-[#A3A3A3]">
                    Everyone in FOCUS group can see your post
                  </span>
                </div>
              </label>
            </form>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={(e) => {
                handleClose();
                e.stopPropagation();
              }}
              className="w-20 rounded-md bg-gray-300 py-2 font-bold text-gray-700 transition hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={(e) => { 
                handleSubmit();
                e.stopPropagation();
              }}
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
                {modalTitle === "Create New Post" ? (isSubmitting ? "Posting..." : "Post") : (isSubmitting ? "Saving..." : "Save")}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
