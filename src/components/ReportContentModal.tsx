'use client'

import React, { useState } from "react";
import { MAX_DESCRIPTION_LEN } from "@/utils/consts";
import { Check, ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "./ui/command";
import { ReportReason } from "@/utils/types/report";
import { useRouter } from "next/navigation";

type ReportContentModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  onSubmit: (title: string, content: string) => Promise<void>;
}

export default function ReportContentModal(props: ReportContentModalProps) {
  const {
    isOpen,
    closeModal,
    onSubmit
  } = props;

  const [selectedReason, setSelectedReason] = useState<string>("");
  const [showReasons, setShowReasons] = useState(false);
  const [showReasonError, setReasonError] = useState(false);
  const [description, setDescription] = useState<string>("");
  const [mouseDownOnBackground, setMouseDownOnBackground] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      if (validateSubmission()) {
        setIsSubmitting(true);
        await onSubmit(selectedReason, description);
        closeModal();
      }
    } catch (error) {} finally {
      setIsSubmitting(false);
    }
  }

  const validateSubmission = (): boolean => {
    const isReasonValid = selectedReason.length > 0;
    setReasonError(!isReasonValid);
    return isReasonValid;
  }

  const handleClose = () => {
    closeModal();
    setReasonError(false);
  }

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
    return <></>
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-5xl relative z-50 flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <div className="text-black text-xl font-bold">Report Content</div>
          <X className="w-6 h-6 cursor-pointer" onClick={handleClose} />
        </div>
        
        <div className="relative mb-6">
          <label htmlFor="reason" className="block text-sm font-bold text-gray-700">
            Reason
            <span className="text-error-red text-base font-medium">*</span>
          </label>
          <div className="relative w-full mt-1">
            <Popover open={showReasons} onOpenChange={setShowReasons}>
              <PopoverTrigger asChild className="w-full" onClick={() => setShowReasons(!showReasons)}>
                <div className={`relative flex items-center p-3 border ${showReasonError ? 'border-error-red' : 'border-gray-300'} rounded-md cursor-pointer`}>
                  <div className="flex items-center w-full h-6">
                    {selectedReason ? (
                      <span className="text-black text-sm font-medium">{selectedReason}</span>
                    ) : (
                      <div className="text-neutral-400 text-sm font-normal">
                        Select reason
                      </div>
                    )}
                  </div>
                  {showReasons ? (
                    <ChevronUp className="w-4 h-4" color="#7D7E82" />
                  ) : (
                    <ChevronDown className="w-4 h-4" color="#7D7E82" />
                  )}
                </div>
              </PopoverTrigger>

              <PopoverContent align="start" className="overflow-visible p-2">
                <Command>
                  <CommandList className="max-h-32 overflow-y-auto">
                    <CommandEmpty>No city found.</CommandEmpty>
                    <CommandGroup>
                      {Object.values(ReportReason).map((reason: string) => (
                        <CommandItem key={reason} onSelect={() => {
                          handleReasonSelect(reason)}
                        }
                        className={`flex items-center p-2 cursor-pointer rounded-lg hover:bg-gray-100 h-10`}>
                          {selectedReason === reason && (
                            <Check className="w-4 h-4 mr-2" color="#7D7E82" />
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

          {showReasonError ? <div className="text-error-red text-sm font-normal">Required Field</div> : null }
        </div>

        <div className="relative mb-6">
          <label htmlFor="description" className="block text-sm font-bold text-gray-700">
            Description
          </label>
          <div className={`w-full mt-1 p-3 border rounded-md flex flex-col`}>
            <textarea
              id="description"
              value={description}
              maxLength={MAX_DESCRIPTION_LEN}
              placeholder="Enter description"
              onChange={(event) => setDescription(event.target.value)}
              className="focus:outline-none resize-none"
            />
            <div className="text-gray-400 text-sm text-right">
              {description.length}/{MAX_DESCRIPTION_LEN}
            </div>
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
          <div className="text-white font-bold">{isSubmitting ? 'Submitting...' : 'Submit'}</div>
          </button>
        </div>
      </div> 
    </div> 
  );
}