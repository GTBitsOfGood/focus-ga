'use client'

import { ChevronDown, Check, X, ChevronUp } from "lucide-react";
import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter } from "@/utils/types/common"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

type DropdownProps = {
  filter: Filter<any>;
};

export default function DropdownComponent (
  props: DropdownProps
) {
  const [showData, setShowData] = useState(false);

  const handleItemClick = (item: any) => {
    props.filter.setSelected(item);
  };

  return (
    <Popover onOpenChange={(open) => setShowData(open)}>
      <PopoverTrigger
        asChild
      >
        <div className="relative flex items-center justify-center rounded-full cursor-pointer bg-dropdown-gray py-2 px-4">
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

      <PopoverContent align="start" className="p-2">
        <Command>
          <CommandInput placeholder={`Search ${props.filter.label.toLowerCase()}`} />
          <CommandList>
            <CommandEmpty>No {props.filter.label.toLowerCase()} found.</CommandEmpty>
            <CommandGroup>
              {props.filter.data.map((d) => (
                <CommandItem
                  key={d._id}
                  value={d.name}
                  onSelect={() => {
                    handleItemClick(d);
                  }}
                  className="flex items-center p-2 cursor-pointer rounded-lg hover:bg-gray-100 h-10"
                >
                  {props.filter.selected.some((item) => item._id === d._id) && (
                    <Check className="w-4 h-4 mr-2" color="black" />
                  )}
                  {d.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
