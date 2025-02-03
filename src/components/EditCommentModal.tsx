"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";

type EditCommentModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  modalTitle?: string;
  comment: string;
  onSubmit: (newComment: string) => Promise<void>;
};

export default function EditCommentModal(props: EditCommentModalProps) {
  const {
    isOpen,
    closeModal,
    modalTitle = "Edit Comment",
    comment: initialComment,
    onSubmit,
  } = props;

  const [showTitleError, setTitleError] = useState(false);
  const [mouseDownOnBackground, setMouseDownOnBackground] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comment, setComment] = useState(initialComment);
  const { user } = useUser();

  const handleSubmit = async () => {
    try {
      if (comment.length != 0) {
        console.log("HI");
        setIsSubmitting(true);
        await onSubmit(comment);
        closeModal();
      }
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    closeModal();
    setTitleError(false);
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
          <div
            className={`mt-1 w-full border p-3 ${showTitleError ? "border-error-red" : "border-gray-300"} flex items-center justify-between rounded-md`}
          >
            <textarea
              id="title"
              value={comment}
              placeholder="Enter comment content"
              onChange={(event) => setComment(event.target.value)}
              className="max-h-[35vh] min-h-[25px] w-full focus:outline-none"
            />
          </div>

          {showTitleError ? (
            <div className="text-sm font-normal text-error-red">
              Required Field
            </div>
          ) : null}
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
              {isSubmitting ? "Saving..." : "Save"}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
