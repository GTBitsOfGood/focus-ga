'use client'

import React, { useState, useRef } from "react";
import { Disability } from "@/utils/types/disability";
import { X, Trash2 } from "lucide-react";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { cn } from "@/lib/utils";
import { useDisabilities } from "@/contexts/DisabilityContext";
import { Report } from "@/utils/types/report";
import ReportComponent from "./ReportComponent";

type EditPostModalProps = {
  isOpen: boolean;
  reports: Report[];
  closeModal: () => void;
  onSubmit: (title: string, content: string, tags: Disability[]) => Promise<void>;
}

export default function ContentReportsModal(props: EditPostModalProps) {
  const {
    isOpen,
    reports,
    closeModal,
    onSubmit
  } = props;

  const [showTitleError, setTitleError] = useState(false);
  const [showBodyError, setBodyError] = useState(false);
  const disabilities = useDisabilities();
  const [mouseDownOnBackground, setMouseDownOnBackground] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editorRef = useRef<MDXEditorMethods | null>(null);

  const handleSubmit = async () => {
    
  }

  const handleClose = () => {
    closeModal();
    setBodyError(false);
    setTitleError(false);
  }

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
      <div className="bg-white p-11 rounded-lg shadow-lg w-full max-w-3xl relative z-50 flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center mb-2">
          <div className="text-black text-xl font-bold">Content Report(s)</div>
          <X className="w-6 h-6 cursor-pointer" onClick={handleClose} />
        </div>

        <div className="my-5 overflow-y-auto">
          {
            reports.map((report) => {
              return <ReportComponent key={report._id} report={report} />;
            })
          }
        </div>

        <div className="flex flex-row justify-between items-center">
          <button className="flex flex-row items-center font-bold text-error-red gap-x-1.5 text-lg">
            <Trash2 />
            Delete Post
          </button>
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleClose}
              className="w-20 py-2 bg-gray-300 text-gray-700 rounded-md transition hover:bg-gray-400 font-bold"
            >
              Ignore
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
            <div className="text-white font-bold">Edit Content</div>
            </button>
          </div>
        </div>
      </div> 
    </div> 
  );
}