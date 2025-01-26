import { useState } from "react";
import { X } from "lucide-react";
import { deleteDialogText } from "@/utils/deleteDialogText";

type DialogType = keyof typeof deleteDialogText;

type DeleteDialogProps = {
  setShowDeleteDialog: (value: boolean) => void;
  deleteLoading: boolean;
  handleDeleteClick: () => void;
  type: DialogType;
};

export default function ConfirmDeleteDialog({
  setShowDeleteDialog,
  deleteLoading,
  handleDeleteClick,
  type,
}: DeleteDialogProps) {
  const [mouseDownOnBackground, setMouseDownOnBackground] = useState(false);
  const dialogText = deleteDialogText[type];

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setMouseDownOnBackground(true);
    } else {
      setMouseDownOnBackground(false);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mouseDownOnBackground && e.target === e.currentTarget) {
      setShowDeleteDialog(false);
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
            onClick={() => setShowDeleteDialog(false)}
          />
        </div>
        <div className="mx-6 mb-7 mt-5 text-center text-lg font-semibold leading-[1.4] text-black">
          {dialogText.description}
        </div>
        <div className="mb-4 flex justify-center space-x-4">
          <button
            onClick={() => setShowDeleteDialog(false)}
            className="w-24 rounded-md bg-gray-300 py-2 font-bold text-gray-700 transition hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteClick}
            className="inline-flex w-24 items-center justify-center gap-2.5 rounded-lg bg-theme-blue px-4 py-2"
          >
            <div className="font-bold text-white">
              {deleteLoading ? dialogText.loading : dialogText.button}
            </div>
          </button>
        </div>
      </div>
    </div>
    // <AlertDialog open={showDeleteDialog}>
    //   <AlertDialogContent>
    //     <AlertDialogHeader>
    //       <AlertDialogTitle>Delete Post</AlertDialogTitle>
    //       <AlertDialogDescription>
    //         Are you sure you want to delete this post?
    //       </AlertDialogDescription>
    //     </AlertDialogHeader>
    //     <AlertDialogFooter>
    //       <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
    //         Cancel
    //       </AlertDialogCancel>
    //       <AlertDialogAction
    //         disabled={deleteLoading}
    //         onClick={handleDeleteClick}
    //         className="bg-theme-blue transition hover:bg-theme-blue hover:opacity-90"
    //       >
    //         {deleteLoading ? "Deleting..." : "Delete"}
    //       </AlertDialogAction>
    //     </AlertDialogFooter>
    //   </AlertDialogContent>
    // </AlertDialog>
  );
}
