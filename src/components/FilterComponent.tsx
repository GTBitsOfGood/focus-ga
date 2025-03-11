"use client";

import { MAX_FILTER_AGE, MIN_FILTER_AGE } from "@/utils/consts";
import DropdownComponent from "./DropdownComponent";
import RangeSliderComponent from "./RangeSliderComponent";
import { Filter } from "@/utils/types/common";
import { useEffect, useState } from "react";

type FilterProps = {
  setClearAll: React.Dispatch<React.SetStateAction<boolean>>;
  filters: Filter<any>[];
  searchTerm: string;
};

export default function FilterComponent({ setClearAll, filters, searchTerm }: FilterProps) {
  const [hasFilters, setHasFilters] = useState(false);
  
  useEffect(() => {
    const hasDisabilityFilters = filters[0]?.selected?.length > 0;
    const hasTagFilters = filters[1]?.selected?.length > 0;
    const ageFilter = filters[2]?.selected[0];
    const hasAgeFilter = ageFilter?.minAge !== MIN_FILTER_AGE || ageFilter?.maxAge !== MAX_FILTER_AGE;
    
    setHasFilters(
      hasDisabilityFilters || 
      hasTagFilters || 
      hasAgeFilter || 
      searchTerm.length > 0
    );
  }, [filters, searchTerm]);

  return (
    <div className="relative flex flex-wrap w-full items-center space-x-4">
      <label className="block text-sm font-bold hidden sm:block">Filter By:</label>
      
      {filters.map((filter, index) => 
        filter.label === "Age" ? (
          <RangeSliderComponent
            key={`age-filter-${index}`}
            label={filter.label}
            minAge={MIN_FILTER_AGE}
            maxAge={MAX_FILTER_AGE}
            onChange={(minAge, maxAge) => filter.setSelected({
              minAge,
              maxAge,
              _id: `age-${minAge}-${maxAge}`
            })}
            initialMinAge={filter.selected[0]?.minAge ?? MIN_FILTER_AGE}
            initialMaxAge={filter.selected[0]?.maxAge ?? MAX_FILTER_AGE}
          />
        ) : (
          <DropdownComponent 
            key={`${filter.label}-${index}`} 
            filter={filter} 
          />
        )
      )}
      
      <button
        disabled={!hasFilters}
        onClick={() => setClearAll(true)}
        className={`text-sm text-theme-blue pt-4 sm:py-0 w-full sm:w-min whitespace-nowrap font-bold ${!hasFilters && 'hidden'}`}
      >
        Clear All
      </button>
    </div>
  );
}
