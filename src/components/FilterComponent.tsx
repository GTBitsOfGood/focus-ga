'use client'

import DropdownComponent from "./DropdownComponent";
import { Filter } from "@/utils/consts"

type FilterProps = {
  filters: Filter<any>[];
}

export default function FilterComponent( props: FilterProps ) {
  return (
    <div className="relative inline-block w-full flex space-x-4 items-center">
      <label className="block text-sm font-medium">Filter By:</label>
        {props.filters.map((filter, index) => (
          <DropdownComponent key = {index} filter={filter} />
        ))}
    </div>
  );
}
