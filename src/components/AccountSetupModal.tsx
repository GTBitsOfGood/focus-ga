"use client";

import React, { useState } from "react";
import {editUser} from "@/server/db/actions/UserActions";

type AccountSetupModalProps = {
  isOpen: boolean;
  closeModal: () => void;
};

type Child = {
  name: string;
  dob: Date | null;
  disability: string;
};


export default function AccountSetupModal(props: AccountSetupModalProps) {
  const {
    isOpen,
    closeModal,
  } = props;

  const [location, setLocation] = useState("");
  const [children, setChildren] = useState<Child[]>([]);
  const [error, setError] = useState("");

  const handleClose = () => {
    closeModal();
  };

  const handleAddChild = () => {
    setChildren([...children, { name: "", dob: null ,disability: ""}]);
  };

  const handleSave = async () => {
    if (!location) {
      setError("Please select a location.");
      return;
    }

    if (children.some(child => !child.name || !child.dob || !child.disability)) {
      setError("Please fill out all child information.");
      return;
    }

    try {
      //await editUser({ location, children });
      closeModal();
    } catch (err) {
      setError("Failed to save information. Please try again.");
    }
  };

  if (!isOpen) {
    return <></>;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div className="relative z-50 flex max-h-[80vh] w-full max-w-3xl flex-col rounded-lg bg-white p-11 shadow-lg">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xl font-bold text-black">Set up Account</div>
        </div>

        <div className="my-5 overflow-y-auto pr-4">
          <div className="mb-4">
            <label className="block mb-2">Location:</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select a location</option>
              <option value="New York">New York</option>
              <option value="Los Angeles">Los Angeles</option>
              <option value="Chicago">Chicago</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2">Children:</label>
            {children.map((child, index) => (
              <div key={index} className="mb-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={child.name}
                  //onChange={(e) => handleChildChange(index, "name", e.target.value)}
                  className="p-2 border rounded"
                />
                <input
                  type="Date"
                  placeholder="Date of Birth"
                  //value={child.dob}
                  //onChange={(e) => handleChildChange(index, "dob", e.target.value)}
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Disability"
                  value={child.disability}
                  //onChange={(e) => handleChildChange(index, "disability", e.target.value)}
                  className="p-2 border rounded"
                />
              </div>
            ))}
            <button
              onClick={handleAddChild}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Child
            </button>
          </div>
         </div>

         <div className="mt-5 flex flex-row items-center justify-between">
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                handleClose();
              }}
              className="rounded-md bg-gray-300 px-6 py-2 font-bold text-gray-700 transition hover:bg-gray-400"
            >
              Set up later
            </button>
            <button
              onClick={handleSave}
              className="inline-flex min-w-20 items-center justify-center gap-2.5 rounded-lg bg-theme-blue px-6 py-2 transition hover:bg-blue-900"
            >
              <div className="font-bold text-white">Save</div>
            </button>
          </div>
      </div>
    </div>
  </div>
  );
}
