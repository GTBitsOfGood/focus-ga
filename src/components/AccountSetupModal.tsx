"use client";

import React, { useState, useEffect } from "react";
import { editUser } from "@/server/db/actions/UserActions";
import { getDisabilities } from "@/server/db/actions/DisabilityActions";
import { Disability } from "@/utils/types/disability";
import { getAuthenticatedUser } from "@/server/db/actions/AuthActions";
import { GEORGIA_CITIES } from "@/utils/cities";
import Image from "next/image";
import focusLogo from "../../public/focus-logo.png";
import DropdownWithDisplay from "./DropdownWithDisplay";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AccountSetupModalProps = {
  isOpen: boolean;
  closeModal: () => void;
};

type Child = {
  name: string;
  dob: Date | null;
  disability: Disability[] | null;
};

export default function AccountSetupModal({
  isOpen,
  closeModal,
}: AccountSetupModalProps) {
  const [location, setLocation] = useState("");
  const [disabilities, setDisabilities] = useState<Disability[]>([]);
  const [children, setChildren] = useState<Child[]>([
    { name: "", dob: null, disability: null },
  ]);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchDisabilities = async () => {
      try {
        const response = await getDisabilities();
        const sortedDisabilities = [...response].sort((a, b) =>
          a.name.localeCompare(b.name),
        );
        setDisabilities(sortedDisabilities);
      } catch {
        setError("Failed to load disabilities.");
      }
    };
    fetchDisabilities();
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"; //stop scrolling in the bg
    }
  }, [isOpen]);

  const handleAddChild = () => {
    setChildren([...children, { name: "", dob: null, disability: [] }]);
  };

  const handleDeleteChild = (index: number) => {
    setChildren((prevChildren) => {
      const updatedChildren = [...prevChildren];
      updatedChildren.splice(index, 1);
      return updatedChildren;
    });
  };

  const handleChildChange = (
    index: number,
    field: "name" | "dob" | "disability",
    value: string | Date | Disability[] | null,
  ) => {
    setChildren((prevChildren) => {
      const updatedChildren = [...prevChildren];
      updatedChildren[index] = { ...updatedChildren[index], [field]: value };
      return updatedChildren;
    });
  };

  const handleSave = async () => {
    if (!location) {
      toast({
        title: "Failed to save",
        description: "Please enter a location.",
        variant: "destructive",
      });
      return;
    }

    if (
      children.some((child) => !child.name || !child.dob || !child.disability)
    ) {
      toast({
        title: "Failed to save",
        description: "Please enter all child information.",
        variant: "destructive",
      });
      return;
    }

    try {
      const authenticatedUser = await getAuthenticatedUser();
      const childBirthdates = children
        .map((child) => child.dob)
        .filter((dob) => dob !== null) as Date[];
      const childDisabilities = children
        .flatMap((child) => child.disability || []) //since it's currently an array of arrays
        .map((disability) => disability._id);

      if (authenticatedUser) {
        await editUser(authenticatedUser._id, {
          city: location,
          childBirthdates,
          childDisabilities,
        });
      }
      closeModal();
    } catch {
      setError("Failed to save information. Please try again.");
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="flex w-full max-w-xl flex-col rounded-lg bg-white px-8 shadow-lg"
        style={{
          maxHeight: "85vh",
          overflow: "hidden",
        }}
      >
        <header className="flex flex-col items-center pb-2 pt-6">
          <Image src={focusLogo} width={200} height={100} alt="focus-logo" />
          <h2 className="mt-2 text-xl text-black">Set up Account</h2>
        </header>

        <main
          className="flex-1 px-6 py-1"
          style={{
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <div className="mb-4">
            <label className="mb-2 block">Location</label>
            <DropdownWithDisplay
              items={[...GEORGIA_CITIES]
                .sort()
                .map((city) => ({ _id: city, name: city }))}
              selectedItems={
                location ? [{ _id: location, name: location }] : []
              }
              onChange={(selectedItems) =>
                setLocation(selectedItems[0]?.name || "")
              }
              displayKey="name"
              placeholder="Search for location"
              typeDropdown="locations"
              //maxSelectionCount={1}
            />
          </div>

          <div className="flex-inline">
            <div className="mb-2">
              {children.map((child, index) => (
                <div key={index} className="mb-2 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="mb-2 block">
                      FOCUS Child {index + 1}{" "}
                    </label>
                    {index === 0 ? (
                      <button
                        onClick={handleAddChild}
                        className="rounded-lg px-4 py-2 text-theme-blue transition hover:opacity-90"
                      >
                        + Add Child
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDeleteChild(index)}
                        className="px-4 py-2 text-theme-blue transition hover:opacity-90"
                      >
                        <Trash2 />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="First name"
                      value={child.name}
                      onChange={(e) =>
                        handleChildChange(index, "name", e.target.value)
                      }
                      className="rounded rounded-lg border border-gray-300 p-3 text-sm"
                    />
                    {child.dob ? (
                      <input
                        type="date"
                        value={child.dob.toISOString().split("T")[0]} //yyyy-mm-dd
                        onChange={(e) =>
                          handleChildChange(
                            index,
                            "dob",
                            e.target.value ? new Date(e.target.value) : null,
                          )
                        }
                        className="rounded rounded-lg border border-gray-300 p-3 text-sm"
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder="Date of birth"
                        onFocus={(e) => {
                          e.target.type = "date";
                        }}
                        onChange={(e) =>
                          handleChildChange(
                            index,
                            "dob",
                            e.target.value ? new Date(e.target.value) : null,
                          )
                        }
                        className="rounded rounded-lg border border-gray-300 p-3 text-sm"
                      />
                    )}

                    <div className="mb-2">
                      <DropdownWithDisplay
                        items={disabilities}
                        selectedItems={child.disability || []}
                        onChange={(selectedDisabilities) =>
                          handleChildChange(
                            index,
                            "disability",
                            selectedDisabilities,
                          )
                        }
                        displayKey="name"
                        placeholder="Disabilities"
                        typeDropdown="disabilities"
                        maxSelectionCount={5}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <footer className="flex flex-col items-center space-y-2 bg-white px-6 py-2">
          <button
            onClick={handleSave}
            className="w-full rounded-lg bg-theme-blue px-6 py-2 text-white transition hover:opacity-90"
          >
            Save
          </button>
          <button
            onClick={closeModal}
            className="w-40 rounded-lg px-6 pb-3 pt-1 text-sm text-theme-blue transition hover:opacity-90"
          >
            Set up later
          </button>
        </footer>
      </div>
    </div>
  );
}
