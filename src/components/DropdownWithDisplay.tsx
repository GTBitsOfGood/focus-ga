import React, { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandGroup, CommandItem, CommandEmpty } from "@/components/ui/command";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import Tag from "./Tag";

type DropdownWithDisplayProps<T extends { _id: string }> = {
  items: T[];
  selectedItems: T[];
  onToggleItem: (item: T) => void;
  displayKey: keyof T;  // The key to display in the dropdown (e.g., "name")
  placeholder?: string;
  maxSelectionCount?: number;
  typeDropdown: string;
};

const DropdownWithDisplay = <T extends { _id: string }>({
  items,
  selectedItems,
  onToggleItem,
  displayKey,
  placeholder = "Select items",
  maxSelectionCount = Infinity,
  typeDropdown
}: DropdownWithDisplayProps<T>) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="relative w-full mt-1">
      <Popover>
        <PopoverTrigger
          asChild
          className="w-full"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="relative flex items-center p-3 border border-gray-300 rounded-md cursor-pointer">
            <div className="flex items-center w-full h-6">
              {selectedItems.length === 0 ? (
                <div className="text-neutral-400 text-sm font-normal">
                    {placeholder} {maxSelectionCount === Infinity ? "" : ` (up to ${maxSelectionCount})`}
                </div>
            
              ) : (
                selectedItems.map((item, index) => (
                  <div
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleItem(item);
                    }}
                    className="mr-2"
                  >
                    <Tag text={item[displayKey] as string} isClickable={true}/>
                  </div>
                ))
              )}
            </div>

            {isDropdownOpen ? (
              <ChevronUp className="w-4 h-4" color="#7D7E82" />
            ) : (
              <ChevronDown className="w-4 h-4" color="#7D7E82" />
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent align="start" className="p-2">
          <Command>
            <CommandInput placeholder={`Search ${typeDropdown}`} />
            <CommandList>
              <CommandEmpty>No {typeDropdown} found.</CommandEmpty>
              <CommandGroup>
                {items.map((item, index) => (
                  <CommandItem
                    key={index}
                    value={item[displayKey] as string}
                    onSelect={() => onToggleItem(item)}
                    className="flex items-center p-2 cursor-pointer rounded-lg hover:bg-gray-100 h-10"
                  >
                    {selectedItems.some(selectedItem => selectedItem._id === item._id) && (
                      <Check className="w-4 h-4 mr-2" color="#7D7E82" />
                    )}
                    {item[displayKey] as string}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DropdownWithDisplay;
