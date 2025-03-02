'use client'

import DropdownComponent from "./DropdownComponent";
import RangeSliderComponent from "./RangeSliderComponent";
import { Filter } from "@/utils/types/common"

type FilterProps = {
  filters: Filter<any>[];
}

export default function FilterComponent( props: FilterProps ) {
  return (
    <div className="relative inline-block w-full flex space-x-4 items-center">
      <label className="block text-sm font-medium">Filter By:</label>
        {props.filters.map((filter, index) => (
          filter.label === "Age" ? 
          <RangeSliderComponent 
            key={index}
            label={filter.label}
            minAge={0}
            maxAge={20}
            onChange={(minAge, maxAge) => {
              console.log('on change called')
              filter.setSelected({ minAge, maxAge, _id: `age-${minAge}-${maxAge}` });
            }}
            initialMinAge={filter.selected.length > 0 ? filter.selected[0].minAge : 3}
            initialMaxAge={filter.selected.length > 0 ? filter.selected[0].maxAge : 20}
          /> :
          <DropdownComponent key={index} filter={filter} />
        ))}
    </div>
  );
}
