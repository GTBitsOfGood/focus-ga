'use client'

import { ChevronDown, Check, ChevronUp } from "lucide-react";
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
import cn from "classnames";

type DropdownProps = {
  filter: Filter<any>;
};

export default function DropdownComponent (
  props: DropdownProps
) {
  const [showData, setShowData] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleItemClick = (item: any) => {
    props.filter.setSelected(item);
  };

  const debounceOopenDropdown = (open: boolean) => {
    setShowData(open);
    setIsDisabled(true);
    setTimeout(() => setIsDisabled(false), 300);
  };

  return (
    <Popover onOpenChange={debounceOopenDropdown}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "relative flex items-center justify-center rounded-full cursor-pointer bg-dropdown-gray py-1 px-3 hover:bg-gray-200 transition",
            { "pointer-events-none": isDisabled },
            { "bg-gray-200": showData }
          )}
        >
          <div className="text-black text-sm font-normal">
            {props.filter.label} {props.filter.selected.length > 0 ? `(${props.filter.selected.length})` : ""}
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
                {props.filter.data
                .sort((a, b) => a.name.localeCompare(b.name))
                .sort((a, b) => {
                  const aSelected = props.filter.selected.some((item) => item._id === a._id);
                  const bSelected = props.filter.selected.some((item) => item._id === b._id);
                  return aSelected === bSelected ? 0 : aSelected ? -1 : 1;
                })
                .map((d) => (
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
