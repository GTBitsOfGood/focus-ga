import React from "react";

type RedoSetupConfirmModalProps = {
  onConfirm: () => void;
  onCancel: () => void;
};

export default function RedoSetupConfirmModal({
  onConfirm,
  onCancel,
}: RedoSetupConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-1/3 max-w-3xl rounded-lg bg-white p-8 shadow-lg">
        <h2 className="text-lg font-bold">Redo Setup</h2>
        <p className="mt-2 text-theme-gray">
          Are you sure you want to redo your profile setup? This will
          permanently delete your child, disabilities, and location information.
          You must set up your account again to continue using the community
          page.
        </p>
        <div className="mt-4 flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="rounded-md bg-gray-300 px-4 py-2 font-bold text-gray-700 transition hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-error-red px-4 py-2 font-bold text-white transition hover:bg-red-600"
          >
            Redo Setup
          </button>
        </div>
      </div>
    </div>
  );
}
