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

  const label = props.filter.label;
  const searchable = props.filter.searchable;

  const handleItemClick = (item: any) => {
    props.filter.setSelected(item);
  };

  const debounceOopenDropdown = (open: boolean) => {
    setShowData(open);
    setIsDisabled(true);
    setTimeout(() => setIsDisabled(false), 300);
  };

  const getFilterText = () => {
    if (searchable) {
      const count = props.filter.selected.length;
      return `${label}${count > 0 ? ` (${count})` : ""}`;
    }
    if (label === "Visibility") {
      const currVisibility = props.filter.selected[0]?.visibility ?? label;
      return currVisibility === "All" ? "Visibility" : currVisibility;
    }

    return label;
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
            {getFilterText()}
          </div>

          {!showData ? (
            <ChevronDown className="w-4 h-4 ml-1" color="black" />
          ) : (
            <ChevronUp className="w-4 h-4 ml-1" color="black" />
          )}
        </div>
      </PopoverTrigger>

      {searchable && 
      <PopoverContent align="start" className="p-2">
        <Command>
          <CommandInput placeholder={`Search ${label.toLowerCase()}`} />
          <CommandList>
            <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
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
      </PopoverContent>}
      {label === "Visibility" &&
      <PopoverContent className="w-42">
        <Command>
          <CommandList>
          <CommandGroup>
                <form className="flex flex-col gap-4 [&>*]:flex [&>*]:gap-2">
                  <label>
                    <input type="radio" name="visibilityFilter" checked={props.filter.selected[0].visibility === 'All'} onChange={() => {
                      props.filter.setSelected({visibility: "All", _id: "All"})
                    }} tabIndex={-1}/>
                    All visibility
                  </label>
                  <label>
                    <input type="radio" name="visibilityFilter" checked={props.filter.selected[0].visibility === 'Public'} onChange={() => {
                      props.filter.setSelected({visibility: "Public", _id: "Public"})
                    }} tabIndex={-1}/>
                    Public only
                  </label>
                  <label>
                    <input type="radio" name="visibilityFilter" checked={props.filter.selected[0].visibility === 'Private'} onChange={() => {
                      props.filter.setSelected({visibility: "Private", _id: "Private"})
                    }} tabIndex={-1}/>
                    Private only
                  </label>
                </form>
              </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent> 
      }
    </Popover>
  );
}
