'use client'

import { ChevronDown, Check, X, ChevronUp } from "lucide-react";
import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter } from "@/utils/consts"

type DropdownProps = {
  filter: Filter<any>;
};

export default function DropdownComponent<T extends { _id: string; name: string }>(
  props: DropdownProps
) {
  const [showData, setShowData] = useState(false);

  const handleItemClick = (item: T) => {
    props.filter.setSelected(item);
  };

  return (
    <Popover onOpenChange={(open) => setShowData(open)}>
      <PopoverTrigger
        asChild
      >
        <div className="relative flex items-center justify-center rounded-full cursor-pointer bg-gray py-2 px-4">
          <div className="text-black text-sm font-normal">
              {props.filter.label}
          </div>

          {!showData ? (
            <ChevronDown className="w-4 h-4 ml-1" color="black" />
          ) : (
            <ChevronUp className="w-4 h-4 ml-1" color="black" />
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent align="start" className="max-h-40 overflow-y-auto p-2">
        <ul>
          {props.filter.data.map((d) => (
            <li
              key={d._id}
              onClick={(e) => {
                e.stopPropagation();
                handleItemClick(d);
              }}
              className="flex items-center p-2 cursor-pointer rounded-lg hover:bg-gray-100 h-10"
            >
              {props.filter.selected.some((item) => item._id === d._id) && (
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
