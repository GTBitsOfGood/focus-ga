import React, { useState, useRef, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, ChevronUp } from "lucide-react";
import cn from "classnames";
import { MAX_FILTER_AGE, MIN_FILTER_AGE } from "@/utils/consts";

type AgeFilterProps = {
  label: string;
  minAge: number;
  maxAge: number;
  onChange: (minAge: number, maxAge: number) => void;
  initialMinAge?: number;
  initialMaxAge?: number;
};

export default function RangeSliderComponent({
  label,
  minAge = MIN_FILTER_AGE,
  maxAge = MAX_FILTER_AGE,
  onChange,
  initialMinAge = MIN_FILTER_AGE,
  initialMaxAge = MAX_FILTER_AGE,
}: AgeFilterProps) {
  const [showPopover, setShowPopover] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const [currentMinAge, setCurrentMinAge] = useState(initialMinAge);
  const [currentMaxAge, setCurrentMaxAge] = useState(initialMaxAge);

  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<string | null>(null);

  // Ref to store the dragging min and max age values
  const currentMinAgeRef = useRef(currentMinAge);
  const currentMaxAgeRef = useRef(currentMaxAge);

  useEffect(() => {
    setCurrentMinAge(initialMinAge);
    setCurrentMaxAge(initialMaxAge);
    currentMinAgeRef.current = initialMinAge;
    currentMaxAgeRef.current = initialMaxAge;
  }, [initialMinAge, initialMaxAge]);

  const debounceOpenDropdown = (open: boolean) => {
    setShowPopover(open);
    setIsDisabled(true);
    setTimeout(() => setIsDisabled(false), 300);
  };

  const calculatePosition = (age: number): number => {
    const cappedAge = Math.max(minAge, Math.min(age, maxAge));
    return ((cappedAge - minAge) / (maxAge - minAge)) * 100;
  };

  const calculateAge = (position: number): number => {
    return Math.max(
      minAge,
      Math.min(
        maxAge,
        Math.round((position / 100) * (maxAge - minAge) + minAge),
      ),
    );
  };

  const handlePointerDown = (e: React.PointerEvent, thumb: string) => {
    e.preventDefault();
    isDraggingRef.current = thumb;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDraggingRef.current || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const position = Math.max(
      0,
      Math.min(100, ((e.clientX - rect.left) / rect.width) * 100),
    );

    if (isDraggingRef.current === "min") {
      currentMinAgeRef.current = Math.min(
        calculateAge(position),
        currentMaxAgeRef.current - 1,
      );
    } else {
      currentMaxAgeRef.current = Math.max(
        calculateAge(position),
        currentMinAgeRef.current + 1,
      );
    }

    // Update the displayed min/max positions smoothly during dragging
    setCurrentMinAge(currentMinAgeRef.current);
    setCurrentMaxAge(currentMaxAgeRef.current);
  };

  const handlePointerUp = () => {
    // Update state after dragging ends
    onChange(currentMinAgeRef.current, currentMaxAgeRef.current);
    isDraggingRef.current = null;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  };

  const minPosition = calculatePosition(currentMinAge);
  const maxPosition = calculatePosition(currentMaxAge);

  return (
    <Popover onOpenChange={debounceOpenDropdown} open={showPopover}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "relative flex cursor-pointer items-center justify-center rounded-full bg-dropdown-gray px-3 py-1 transition hover:bg-gray-200",
            { "pointer-events-none": isDisabled },
            { "bg-gray-200": showPopover },
          )}
        >
          <div className="text-sm font-normal text-black">{label}</div>

          {!showPopover ? (
            <ChevronDown className="ml-1 h-4 w-4" color="black" />
          ) : (
            <ChevronUp className="ml-1 h-4 w-4" color="black" />
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-[300px] rounded-md p-6 pb-0 shadow-lg">
        <div className="space-y-3">
          <h3 className="text-base font-medium text-gray-700">
            Range for age filter
          </h3>
          <div className="relative h-16 pt-6">
            <div
              ref={sliderRef}
              className="absolute inset-x-0 mx-2 h-[5px] cursor-pointer rounded bg-gray-200"
              style={{ top: "24px" }}
            >
              <div
                className="absolute h-full rounded bg-theme-blue opacity-80"
                style={{
                  left: `${Math.max(0, minPosition)}%`,
                  width: `${maxPosition - Math.max(0, minPosition)}%`,
                }}
              />
              <div
                className="absolute flex flex-col items-center"
                style={{
                  left: `${minPosition}%`,
                  transform: "translateX(-50%)",
                  top: "-30px",
                }}
              >
                <span className="mb-1 text-sm text-gray-600">
                  {currentMinAge}
                </span>
                <div
                  className="z-10 -mb-1.5 h-4 w-4 cursor-grab rounded-full bg-theme-blue shadow"
                  onPointerDown={(e) => handlePointerDown(e, "min")}
                />
              </div>
              <div
                className="absolute flex flex-col items-center"
                style={{
                  left: `${maxPosition}%`,
                  transform: "translateX(-50%)",
                  top: "-30px",
                }}
              >
                <span className="mb-1 text-sm text-gray-600">
                  {currentMaxAge === maxAge ? `${maxAge}+` : currentMaxAge}
                </span>
                <div
                  className="z-10 -mb-1.5 h-4 w-4 cursor-grab rounded-full bg-theme-blue shadow"
                  onPointerDown={(e) => handlePointerDown(e, "max")}
                />
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
