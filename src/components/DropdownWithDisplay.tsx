import React, { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandGroup, CommandItem, CommandEmpty } from "@/components/ui/command";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import Tag from "./Tag";
import { useToast } from "@/hooks/use-toast";
import { FixedSizeList as List } from "react-window";

type DropdownWithDisplayProps<T extends { _id: string }> = {
  items: T[];
  selectedItems: T[];
  onChange: (items: T[]) => void;
  displayKey: keyof T;  // The key to display in the dropdown (e.g., "name")
  placeholder?: string;
  maxSelectionCount?: number;
  typeDropdown: string;
};

const DropdownWithDisplay = <T extends { _id: string }>({
  items,
  selectedItems,
  onChange,
  displayKey,
  placeholder = "Select items",
  maxSelectionCount = Infinity,
  typeDropdown
}: DropdownWithDisplayProps<T>) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { toast } = useToast();

  function onItemToggle(item: T) {
    const hasItem = selectedItems.some(selectedItem => selectedItem._id.toString() === item._id.toString());
    let newItems;
    if (hasItem) {
      newItems = selectedItems.filter(i => i._id.toString() !== item._id.toString());
    } else if (selectedItems.length < maxSelectionCount) {
      newItems = [...selectedItems, item];
    } else {
      newItems = selectedItems;
      toast({
        title: "Maximum selection count reached",
        description: `You can only select up to ${maxSelectionCount} ${typeDropdown}.`,
        variant: "destructive",
      });
    }

    onChange(newItems);
  }

  return (
    <div className="w-full mt-1">
      <Popover>
        <PopoverTrigger
          asChild
          className="w-full"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer">
            <div className="flex flex-wrap -mt-2 items-center w-full">
              {selectedItems.length === 0 ? (
                <div className="text-neutral-400 text-sm font-normal mt-2">
                    {placeholder} {maxSelectionCount === Infinity ? "" : ` (up to ${maxSelectionCount})`}
                </div>
            
              ) : (
                selectedItems.map((item, index) => (
                  <div
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      onItemToggle(item);
                    }}
                    className="mr-2 mt-2"
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
            <CommandList className="overflow-y-hidden">
              <CommandEmpty>No {typeDropdown} found.</CommandEmpty>
              <CommandGroup className="overflow-y-hidden">
                <List
                  height={300} // Total height of the dropdown content area
                  itemCount={items.length}
                  itemSize={40} // Height of each item (adjust if needed)
                  width="100%"
                >
                  {({ index, style }) => {
                    const item = items[index];
                    const isSelected = selectedItems.some(selectedItem => selectedItem._id === item._id);
                    
                    return (
                      <div style={style} key={item._id}>
                        <CommandItem
                          value={item[displayKey] as string}
                          onSelect={() => onItemToggle(item)}
                          className="flex items-center p-2 cursor-pointer rounded-lg hover:bg-gray-100 h-10"
                        >
                          {isSelected && <Check className="w-4 h-4 mr-2" color="#7D7E82" />}
                          {item[displayKey] as string}
                        </CommandItem>
                      </div>
                    );
                  }}
                </List>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DropdownWithDisplay;
