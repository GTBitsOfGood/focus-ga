"use client";

import { useState, useEffect } from "react";
import { Disability } from "@/utils/types/disability";
import {
  createDisability,
  getDisabilities,
  deleteDisability,
} from "@/server/db/actions/DisabilityActions";
import Tag from "@/components/Tag";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DisabilitiesList() {
  const [disabilities, setDisabilities] = useState<Disability[]>([]);
  const [disabilityName, setDisabilityName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchDisabilities() {
      try {
        const response = await getDisabilities();
        setDisabilities(response.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        setError("Failed to load disabilities.");
      }
    }
    fetchDisabilities();
  }, []);

  const handleAddDisability = async () => {
    if (!disabilityName.trim()) return;
    
    // Check if disability already exists
    if (disabilities.some(d => d.name.toLowerCase() === disabilityName.toLowerCase())) {
      toast({
        title: "Duplicate disability",
        description: `${disabilityName} already exists in the list.`,
      });
      return;
    }
  
    try {
      const newDisability = await createDisability({ name: disabilityName });
      setDisabilities((prev) =>
        [...prev, newDisability].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setDisabilityName("");
      toast({
        title: "Disability added",
        description: `${disabilityName} has been added as a disability.`,
      });
    } catch (error) {
      toast({
        title: "Failed to add disability",
        description:
          "An error occurred while adding the disability. Please try again.",
      });
    }
  };

  const handleDeleteDisability = async (id: string) => {
    try {
      await deleteDisability(id);
      setDisabilities((prev) => prev.filter((d) => d._id !== id));
      toast({
        title: "Disability deleted",
        description: `${disabilityName} has been deleted as a disability.`,
      });
    } catch (error) {
      toast({
        title: "Failed to delete disability",
        description:
          "An error occurred while deleting the disability. Please try again.",
      });
    }
  };

  const filteredDisabilities = disabilities.filter((disability) =>
    disability.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const groupedDisabilities = filteredDisabilities.reduce(
    (acc: Record<string, Disability[]>, disability) => {
      const firstLetter = disability.name[0].toUpperCase();
      const category = /^[A-Z]$/.test(firstLetter) ? firstLetter : "Other";
      
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(disability);
      return acc;
    },
    {},
  );

  const categoryKeys = Object.keys(groupedDisabilities).sort((a, b) => {
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return a.localeCompare(b);
  });
  
  return (
    <div className="mt-9 max-w-[78%] md:ml-10">
      <h1 className="mb-7 text-2xl font-bold">Disabilities List</h1>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <h2 className="mb-3 text-xl">Add New Disability</h2>
      <div className="mb-6 flex items-center gap-3">
        <input
          type="text"
          value={disabilityName}
          onChange={(e) => setDisabilityName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddDisability()}
          placeholder="Enter disability"
          className="h-10 w-full rounded-md border p-3 py-1.5 text-sm"
        />
        <button
          className="h-10 rounded-md bg-theme-blue px-6 py-1.5 text-white transition hover:opacity-90"
          onClick={handleAddDisability}
        >
          Add
        </button>
      </div>
      <div className="mb-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl">Current Disability List</h2>
          <div className="flex items-center gap-1.5">
            <Search className="text-theme-gray" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-60 border-b p-1 pl-0 focus:border-theme-gray focus:outline-none"
            />
          </div>
        </div>

        {categoryKeys.map((letter) => (
          <div key={letter} className="mb-4">
            <div className="mb-2 text-lg">{letter}</div>
            <div className="flex flex-wrap gap-3">
              {groupedDisabilities[letter].map((disability) => (
                <Tag
                  key={disability._id}
                  text={disability.name}
                  isClickable={true}
                  onClick={() => handleDeleteDisability(disability._id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
