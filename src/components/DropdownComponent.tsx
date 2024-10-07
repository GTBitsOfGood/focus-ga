'use client'

import { ChevronDown, Check, X, ChevronUp } from "lucide-react";
import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DropdownProps<T> = {
  label: string;
  data: T[];
  selected: T[];
  setSelected: (selected: T) => void;
};


export default function DropdownComponent<T extends { _id: string; name: string }>(
  props: DropdownProps<T>
) {
  const [showData, setShowData] = useState(false);

  const handleItemClick = (item: T) => {
    props.setSelected(item);
  };

  return (
    <Popover onOpenChange={(open) => setShowData(open)}>
      <PopoverTrigger
        asChild
      >
        <div className="relative flex items-center p-3 border border-gray-300 rounded-md cursor-pointer">
          <div className="flex items-center w-full h-6">
            <div className="text-neutral-400 text-sm font-normal">
                {props.label}
            </div>
          </div>

          {!showData ? (
            <ChevronDown className="w-4 h-4" color="#7D7E82" />
          ) : (
            <ChevronUp className="w-4 h-4" color="#7D7E82" />
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent align="start" className="max-h-40 overflow-y-auto p-2">
        <ul>
          {props.data.map((d) => (
            <li
              key={d._id}
              onClick={(e) => {
                e.stopPropagation();
                handleItemClick(d);
              }}
              className="flex items-center p-2 cursor-pointer rounded-lg hover:bg-gray-100 h-10"
            >
              {props.selected.some((item) => item._id === d._id) && (
                <Check className="w-4 h-4 mr-2" color="#7D7E82" />
              )}
              {d.name}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
