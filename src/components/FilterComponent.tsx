"use client";

import { MAX_FILTER_AGE, MIN_FILTER_AGE } from "@/utils/consts";
import DropdownComponent from "./DropdownComponent";
import RangeSliderComponent from "./RangeSliderComponent";
import { Filter } from "@/utils/types/common";

type FilterProps = {
  setClearAll: React.Dispatch<React.SetStateAction<boolean>>;
  filters: Filter<any>[];
};

export default function FilterComponent(props: FilterProps) {
  const handleClearFilters = () => {
    props.setClearAll(true);
  };

  return (
    <div className="relative inline-block flex w-full items-center space-x-4">
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
        onClick={handleClearFilters}
        className="text-sm font-medium text-theme-gray"
      >
        Clear All
      </button>
    </div>
  );
}
