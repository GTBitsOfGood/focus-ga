import { useState } from "react";
import { X } from "lucide-react";
import { ConfirmationDialogText } from "@/utils/confirmationDialogText";

type DialogType = keyof typeof ConfirmationDialogText;

type ConfirmationDialogProps = {
  handleCancel: () => void;
  loading: boolean;
  handleConfirm: () => void;
  type: DialogType;
  resolveReports?: () => void;
  duration?: string;
};

export default function ConfirmationDialog({
  handleCancel,
  loading,
  handleConfirm,
  type,
  resolveReports,
  duration,
}: ConfirmationDialogProps) {
  const [mouseDownOnBackground, setMouseDownOnBackground] = useState(false);
  const dialogText = ConfirmationDialogText[type];
  const description =
    type === "changeDeletionTimeline" && duration
      ? dialogText.description.replace("[duration]", duration)
      : dialogText.description;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setMouseDownOnBackground(true);
    } else {
      setMouseDownOnBackground(false);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mouseDownOnBackground && e.target === e.currentTarget) {
      handleCancel();
    }
    setMouseDownOnBackground(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className="relative z-50 flex w-full max-w-md flex-col overflow-y-auto rounded-2xl bg-white p-6 shadow-lg">
        <div className="flex flex-row justify-end">
          <X
            color="#636363"
            className="h-6 w-6 cursor-pointer"
            onClick={handleCancel}
          />
        </div>
        <div className="mx-6 mb-7 mt-5 text-center text-lg font-semibold leading-[1.4] text-black">
          {description}
        </div>
        <div className="mb-4 flex justify-center space-x-4">
          <button
            onClick={handleCancel}
            className="w-24 rounded-md bg-gray-300 py-2 font-bold text-gray-700 transition hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              handleConfirm();
              if (resolveReports) resolveReports();
            }}
            className="inline-flex w-24 items-center justify-center gap-2.5 rounded-lg bg-theme-blue hover:opacity-90 px-4 py-2"
          >
            <div className="font-bold text-white">
              {loading ? dialogText.loading : dialogText.button}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
