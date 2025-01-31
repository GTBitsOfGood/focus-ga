"use client";

import React, { useState } from "react";
import { X, Trash2 } from "lucide-react";
import { ContentType, PopulatedReport } from "@/utils/types/report";
import ReportComponent from "./ReportComponent";

type ContentReportsModalProps = {
  isOpen: boolean;
  reports: PopulatedReport[];
  closeModal: () => void;
  onDelete: (id: string) => void;
  onIgnore: () => void;
  setFromReports: (arg0: boolean) => void;
};

export default function ContentReportsModal(props: ContentReportsModalProps) {
  const { isOpen, reports, closeModal, onDelete, onIgnore, setFromReports } =
    props;

  const [mouseDownOnBackground, setMouseDownOnBackground] = useState(false);

  const id = reports[0].reportedContent.toString();
  const contentType = reports[0].contentType;

  const handleClose = () => {
    setFromReports(false);
    closeModal();
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
      <div className="relative z-50 flex max-h-[80vh] w-full max-w-3xl flex-col rounded-lg bg-white p-11 shadow-lg">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xl font-bold text-black">Content Report(s)</div>
          <X className="h-6 w-6 cursor-pointer" onClick={handleClose} />
        </div>

        <div className="my-5 overflow-y-auto pr-4">
          {reports.map((report, index) => {
            return (
              <ReportComponent
                key={report._id}
                report={report}
                isLast={index == reports.length - 1}
              />
            );
          })}
        </div>

        <div className="mt-5 flex flex-row items-center justify-between">
          <button
            className="flex flex-row items-center gap-x-1.5 text-lg font-bold text-error-red"
            onClick={async () => {
              onDelete(id);
              setFromReports(true);
              closeModal();
            }}
          >
            <Trash2 />
            Delete {contentType === ContentType.COMMENT ? "Comment" : "Post"}
          </button>
          <div className="flex justify-end space-x-4">
            <button
              onClick={async () => {
                onIgnore();
                setFromReports(true);
                closeModal();
              }}
              className="rounded-md bg-gray-300 px-6 py-2 font-bold text-gray-700 transition hover:bg-gray-400"
            >
              Ignore
            </button>
            <button
              onClick={() => {
                // openEdit();
                setFromReports(true);
                closeModal();
              }}
              className="inline-flex min-w-20 items-center justify-center gap-2.5 rounded-lg bg-theme-blue px-6 py-2 transition hover:bg-blue-900"
            >
              <div className="font-bold text-white">Edit Content</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
