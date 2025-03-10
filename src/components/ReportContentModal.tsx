"use client";

import React, { useState } from "react";
import { MAX_DESCRIPTION_LEN } from "@/utils/consts";
import { Check, ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "./ui/command";
import { ReportReason } from "@/utils/types/report";
import { useRouter, usePathname } from "next/navigation";

type ReportContentModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  onSubmit: (title: string, content: string) => Promise<void>;
};

export default function ReportContentModal(props: ReportContentModalProps) {
  const { isOpen, closeModal, onSubmit } = props;

  const [selectedReason, setSelectedReason] = useState<string>("");
  const [showReasons, setShowReasons] = useState(false);
  const [showReasonError, setReasonError] = useState(false);
  const [description, setDescription] = useState<string>("");
  const [mouseDownOnBackground, setMouseDownOnBackground] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSubmit = async () => {
    try {
      if (validateSubmission()) {
        setIsSubmitting(true);
        await onSubmit(selectedReason, description);
        closeModal();
        router.replace(pathname);
      }
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateSubmission = (): boolean => {
    const isReasonValid = selectedReason.length > 0;
    setReasonError(!isReasonValid);
    return isReasonValid;
  };

  const handleClose = () => {
    closeModal();
    setReasonError(false);
  };

  const handleReasonSelect = (reason: string) => {
    setShowReasons(false);
    setSelectedReason(reason);
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
      <div className="relative z-50 flex max-h-[90vh] w-full flex-col overflow-y-auto rounded-lg bg-white p-6 shadow-lg sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xl font-bold text-black">Report Content</div>
          <X className="h-6 w-6 cursor-pointer" onClick={handleClose} />
        </div>

        <div className="relative mb-6">
          <label
            htmlFor="reason"
            className="block text-sm font-bold text-gray-700"
          >
            Reason
            <span className="text-base font-medium text-error-red">*</span>
          </label>
          <div className="relative mt-1 w-full">
            <Popover open={showReasons} onOpenChange={setShowReasons}>
              <PopoverTrigger
                asChild
                className="w-full"
                onClick={() => setShowReasons(!showReasons)}
              >
                <div
                  className={`relative flex items-center border p-3 ${showReasonError ? "border-error-red" : "border-gray-300"} cursor-pointer rounded-md`}
                >
                  <div className="flex h-6 w-full items-center">
                    {selectedReason ? (
                      <span className="text-sm font-medium text-black">
                        {selectedReason}
                      </span>
                    ) : (
                      <div className="text-sm font-normal text-neutral-400">
                        Select reason
                      </div>
                    )}
                  </div>
                  {showReasons ? (
                    <ChevronUp className="h-4 w-4" color="#7D7E82" />
                  ) : (
                    <ChevronDown className="h-4 w-4" color="#7D7E82" />
                  )}
                </div>
              </PopoverTrigger>

              <PopoverContent align="start" className="overflow-visible p-2">
                <Command>
                  <CommandList className="max-h-48 overflow-y-auto">
                    <CommandEmpty>No city found.</CommandEmpty>
                    <CommandGroup>
                      {Object.values(ReportReason).map((reason: string) => (
                        <CommandItem
                          key={reason}
                          onSelect={() => {
                            handleReasonSelect(reason);
                          }}
                          className={`flex h-10 cursor-pointer items-center rounded-lg p-2 hover:bg-gray-100`}
                        >
                          {selectedReason === reason && (
                            <Check className="mr-2 h-4 w-4" color="#7D7E82" />
                          )}
                          {reason}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {showReasonError ? (
            <div className="text-sm font-normal text-error-red">
              Required Field
            </div>
          ) : null}
        </div>

        <div className="relative mb-6">
          <label
            htmlFor="description"
            className="block text-sm font-bold text-gray-700"
          >
            Description
          </label>
          <div className={`mt-1 flex w-full flex-col rounded-md border p-3`}>
            <textarea
              id="description"
              value={description}
              maxLength={MAX_DESCRIPTION_LEN}
              placeholder="Enter description"
              onChange={(event) => setDescription(event.target.value)}
              className="resize-none focus:outline-none"
            />
            <div className="text-right text-sm text-gray-400">
              {description.length}/{MAX_DESCRIPTION_LEN}
            </div>
          </div>
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
              {isSubmitting ? "Submitting..." : "Submit"}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
