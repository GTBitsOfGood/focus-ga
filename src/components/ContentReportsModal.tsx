'use client'

import React, { useState } from "react";
import { X, Trash2 } from "lucide-react";
import { ContentType, PopulatedReport } from "@/utils/types/report";
import ReportComponent from "./ReportComponent";
import { useToast } from "@/hooks/use-toast";

type ContentReportsModalProps = {
  isOpen: boolean;
  reports: PopulatedReport[];
  closeModal: () => void;
  onDeleteContent: (id: string) => void;
}

export default function ContentReportsModal(props: ContentReportsModalProps) {
  const {
    isOpen,
    reports,
    closeModal,
    onDeleteContent,
  } = props;

  const [mouseDownOnBackground, setMouseDownOnBackground] = useState(false);
  const { toast } = useToast();

  const id = reports[0].reportedContent.toString();
  const contentType = reports[0].contentType;

  const handleClose = () => {
    closeModal();
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

        <div className="my-5 overflow-y-auto pr-4">
          {
            reports.map((report, index) => {
              return <ReportComponent key={report._id} report={report} isLast={index == reports.length - 1}/>;
            })
          }
        </div>

        <div className="flex flex-row justify-between items-center mt-5">
          <button 
            className="flex flex-row items-center font-bold text-error-red gap-x-1.5 text-lg"
            onClick={() => {
              onDeleteContent(id);
              closeModal();
            }}
          >
            <Trash2 />
            Delete {contentType === ContentType.COMMENT ? 'Comment' : 'Post'}
          </button>
          <div className="flex justify-end space-x-4">
            <button
              className="w-20 py-2 bg-gray-300 text-gray-700 rounded-md transition hover:bg-gray-400 font-bold"
            >
              Ignore
            </button>
            <button 
              className="min-w-20 py-2 px-4 bg-theme-blue rounded-lg justify-center items-center gap-2.5 inline-flex transition hover:bg-blue-900"
            >
              <div className="text-white font-bold">Edit Content</div>
            </button>
          </div>
        </div>
      </div> 
    </div> 
  );
}