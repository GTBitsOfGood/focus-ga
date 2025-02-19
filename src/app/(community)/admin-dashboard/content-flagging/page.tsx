  'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Profanity, ProfanityInput } from "@/utils/types/profanity";
import Tag from "@/components/Tag";
import { addProfanity, getAllProfanities, deleteProfanity } from "@/server/db/actions/ProfanityActions";

export default function ProfanityList() {
  const [profanities, setProfanities] = useState<Profanity[]>([]);
  const [profanityName, setProfanityName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchProfanities() {
      try {
        const response = await getAllProfanities();
        setProfanities(response);
      } catch (error) {
        setError("Failed to load profanities.");
      }
    }
    fetchProfanities();
  }, []);

  const handleAddProfanity = async () => {
    if (!profanityName.trim()) return;
    try {
      const newProfanity: ProfanityInput = { name: profanityName };
      const createdProfanity = await addProfanity(newProfanity);
      setProfanities((prev) => [...prev, createdProfanity]);
      setProfanityName("");
      toast({
        title: "Profanity added",
        description: `${profanityName} has been added as a profanity.`,
      });
    } catch (error) {
      toast({
        title: "Failed to add profanity",
        description: `An error occurred while adding the profanity. "${profanityName}" may have already been added.`,
      });
    }
  };

  const handleDeleteProfanity = async (id: string) => {
    try {
      await deleteProfanity(id);
      setProfanities((prev) => prev.filter((p) => p._id !== id));
      toast({
        title: "Profanity deleted",
        description: "The profanity has been deleted.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete profanity",
        description: "An error occurred while deleting the profanity. Please try again.",
      });
    }
  };

  const filteredProfanities = profanities.filter((profanity) =>
    profanity.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const groupedProfanities = filteredProfanities.reduce(
    (acc: Record<string, Profanity[]>, profanity) => {
      const firstLetter = /^[a-zA-Z]/.test(profanity.name) ? profanity.name[0].toUpperCase() : "Other";
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(profanity);
      return acc;
    },
    {},
  );

  const sortedLetters = Object.keys(groupedProfanities).sort((a, b) => {
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="mt-9 max-w-[78%] md:ml-10">
      <h1 className="mb-7 text-2xl font-bold">Content Flagging</h1>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <h2 className="mb-3 text-xl">Add New Word</h2>
      <div className="mb-6 flex items-center gap-3">
        <input
          type="text"
          value={profanityName}
          onChange={(e) => setProfanityName(e.target.value)}
          placeholder="Enter profanity"
          onKeyDown={(e) => e.key === "Enter" && handleAddProfanity()}
          className="h-10 w-full rounded-md border p-3 py-1.5 text-sm"
        />
        <button
          className="h-10 rounded-md bg-theme-blue px-6 py-1.5 text-white transition hover:opacity-90"
          onClick={handleAddProfanity}
        >
          Add
        </button>
      </div>
      <div className="mb-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl">Current Profanity List</h2>
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

        {sortedLetters.map((letter) => (
          <div key={letter} className="mb-4">
            <div className="mb-2 text-lg">{letter}</div>
            <div className="flex flex-wrap gap-3">
              {groupedProfanities[letter].map((profanity) => (
                <Tag
                  key={profanity._id}
                  text={profanity.name}
                  isClickable={true}
                  onClick={() => handleDeleteProfanity(profanity._id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}