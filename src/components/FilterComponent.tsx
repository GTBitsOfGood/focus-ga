"use client";

import { MAX_FILTER_AGE, MIN_FILTER_AGE } from "@/utils/consts";
import DropdownComponent from "./DropdownComponent";
import RangeSliderComponent from "./RangeSliderComponent";
import { Filter } from "@/utils/types/common";
import { useEffect, useState } from "react";

type FilterProps = {
  setClearAll: React.Dispatch<React.SetStateAction<boolean>>;
  filters: Filter<any>[];
};

export default function FilterComponent(props: FilterProps) {
  const [hasFilters, setHasFilters] = useState(false);
  const handleClearFilters = () => {
    props.setClearAll(true);
  };

  useEffect(() => {
    setHasFilters(
      props.filters[0].selected.length > 0 ||
      props.filters[1].selected.length > 0 ||
      (props.filters[2].selected[0].minAge !== 0 || props.filters[2].selected[0].maxAge !== 20) ||
      props.filters[3].selected[0].visibility !== 'All'
    );
  }, [props]);

  return (
    <div className="relative flex flex-wrap w-full items-center space-x-4">
      <label className="block text-sm font-medium">Filter By:</label>
      {props.filters.map((filter, index) =>
        filter.label === "Age" ? (
          <RangeSliderComponent
            key={index}
            label={filter.label}
            minAge={MIN_FILTER_AGE}
            maxAge={MAX_FILTER_AGE}
            onChange={(minAge, maxAge) => {
              filter.setSelected({
                minAge,
                maxAge,
                _id: `age-${minAge}-${maxAge}`,
              });
            }}
            initialMinAge={
              filter.selected.length > 0 ? filter.selected[0].minAge : 3
            }
            initialMaxAge={
              filter.selected.length > 0 ? filter.selected[0].maxAge : 20
            }
          />
        ) : (
          <DropdownComponent key={index} filter={filter} />
        ),
      )}
      <button
        disabled={!hasFilters}
        onClick={handleClearFilters}
        className={`text-sm text-theme-blue font-bold ${
          hasFilters ? "" : "hidden"
        }`}
      >
        Clear All 
      </button>
    </div>
  );
}
