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
    try {
      const newDisability = await createDisability({ name: disabilityName });
      setDisabilities((prev) =>
        [...prev, newDisability].sort((a, b) => a.name.localeCompare(b.name))
      );
      setDisabilityName("");
      toast({
        title: "Disability Added",
      });
    } catch (error) {
      toast({
        title: "Failed to add disability",
        description: "An error occurred while adding the disability. Please try again.",
      });
    }
  };

  const handleDeleteDisability = async (id: string) => {
    try {
      await deleteDisability(id);
      setDisabilities((prev) => prev.filter((d) => d._id !== id));
      toast({
        title: "Disability Deleted",
      });
    } catch (error) {
      toast({
        title: "Failed to delete disability",
        description: "An error occurred while deleting the disability. Please try again.",
      });
    }
  };

  const filteredDisabilities = disabilities.filter((disability) =>
    disability.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedDisabilities = filteredDisabilities.reduce(
    (acc: Record<string, Disability[]>, disability) => {
      const firstLetter = disability.name[0].toUpperCase();
      if (!acc[firstLetter]){
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(disability);
      return acc;
    },
    {}
  );

  return (
    <div className="container mx-auto ml-10 p-6 max-w-4xl mt-5">
      <h1 className="text-2xl font-bold mb-7">Disabilities List</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <h2 className="text-xl mb-3">Add New Disability</h2>
      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          value={disabilityName}
          onChange={(e) => setDisabilityName(e.target.value)}
          placeholder="Enter disability"
          className="border p-3 rounded-md w-full py-1.5 text-sm h-10"
        />
        <button
          className="bg-theme-blue text-white px-6 py-1.5 rounded-md transition hover:opacity-90 h-10"
          onClick={handleAddDisability}
        >
          Add
        </button>
      </div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl">Current Disability List</h2>
          <div className="flex items-center gap-1.5">
            <Search className="text-theme-gray" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="border-b p-1 pl-0 w-60 focus:outline-none focus:border-theme-gray"
            />
          </div>
        </div>

        {Object.keys(groupedDisabilities).map((letter) => (
          <div key={letter} className="mb-4">
            <div className="text-lg mb-2">{letter}</div>
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
