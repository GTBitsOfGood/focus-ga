"use client";

import DropdownComponent from "./DropdownComponent";
import { Filter } from "@/utils/types/common";

type FilterProps = {
  filters: Filter<any>[];
};

export default function FilterComponent(props: FilterProps) {
  const handleClearFilters = () => {
    props.filters.map((filter) => {
      filter.setSelected(null);
    });
  };

  return (
    <div className="flex flex-row justify-between">
      <div className="relative inline-block flex w-full items-center space-x-4">
        <label className="block text-sm font-medium">Filter By:</label>
        {props.filters.map((filter, index) => (
          <DropdownComponent key={index} filter={filter} />
        ))}
      </div>
      <button
        onClick={handleClearFilters}
        className="whitespace-nowrap rounded-full border-2 border-theme-blue px-3 py-1 text-sm font-medium text-theme-blue"
      >
        Clear Filters
      </button>
    </div>
  );
}
