import React, { useState, useRef, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, ChevronUp } from "lucide-react";
import cn from "classnames";
import { MAX_FILTER_AGE, MIN_FILTER_AGE } from "@/utils/consts";

type AgeFilterProps = {
  label: string;
  minAge?: number;
  maxAge?: number;
  onChange: (minAge: number, maxAge: number) => void;
  initialMinAge?: number;
  initialMaxAge?: number;
};

type ThumbType = 'min' | 'max';

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
  const [range, setRange] = useState({ min: initialMinAge, max: initialMaxAge });
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<ThumbType | null>(null);
  const rangeRef = useRef(range);
  rangeRef.current = range;

  useEffect(() => {
    setRange({ min: initialMinAge, max: initialMaxAge });
  }, [initialMinAge, initialMaxAge]);

  const handlePopoverToggle = (open: boolean) => {
    setShowPopover(open);
    setIsDisabled(true);
    setTimeout(() => setIsDisabled(false), 300);
  };

  const calculatePosition = (age: number) => {
    const cappedAge = Math.max(minAge, Math.min(age, maxAge));
    return ((cappedAge - minAge) / (maxAge - minAge)) * 100;
  };

  const calculateAge = (position: number) => {
    return Math.round((position / 100) * (maxAge - minAge) + minAge);
  };

  const getPositionFromEvent = (e: PointerEvent) => {
    if (!sliderRef.current) return 0;
    const rect = sliderRef.current.getBoundingClientRect();
    return ((e.clientX - rect.left) / rect.width) * 100;
  };

  const handlePointerDown = (e: React.PointerEvent, thumb: ThumbType) => {
    e.preventDefault();
    isDraggingRef.current = thumb;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDraggingRef.current) return;
    
    const position = getPositionFromEvent(e);
    const newAge = Math.max(minAge, Math.min(maxAge, calculateAge(position)));
    
    setRange(prev => calculateNewRange(prev, newAge, isDraggingRef.current!));
  };

  const calculateNewRange = (current: { min: number, max: number }, newAge: number, thumb: ThumbType) => {
    return thumb === 'min' 
      ? { min: Math.min(newAge, current.max - 1), max: current.max }
      : { max: Math.max(newAge, current.min + 1), min: current.min };
  };

  const handlePointerUp = () => {
    onChange(rangeRef.current.min, rangeRef.current.max);
    isDraggingRef.current = null;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  };

  const Thumb = ({ position, value, thumb }: { 
    position: number; 
    value: number; 
    thumb: ThumbType 
  }) => (
    <div
      className="absolute flex flex-col items-center cursor-default"
      style={{
        left: `${position}%`,
        transform: "translateX(-50%)",
        top: "-30px"
      }}
    >
      <span className="mb-1 text-sm text-gray-600 select-none">
        {thumb === 'max' && value === maxAge ? `${maxAge}+` : value}
      </span>
      <div
        className="z-10 -mb-1.5 h-4 w-4 cursor-grab rounded-full bg-theme-blue shadow"
        onPointerDown={(e) => handlePointerDown(e, thumb)}
      />
    </div>
  );

  return (
    <Popover onOpenChange={handlePopoverToggle} open={showPopover}>
      <PopoverTrigger asChild>
        <div className={cn(
          "relative flex cursor-pointer items-center justify-center rounded-full bg-dropdown-gray px-3 py-1 transition hover:bg-gray-200",
          { "pointer-events-none bg-gray-200": isDisabled || showPopover }
        )}>
          <div className="text-sm font-normal text-black">{label}</div>
          {showPopover ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-[300px] rounded-md p-6 pb-0 shadow-lg">
        <div className="space-y-3">
          <h3 className="text-base font-medium text-gray-700">Age Range</h3>
          <div className="relative h-16 pt-6">
            <div 
              ref={sliderRef}
              className="absolute inset-x-0 mx-2 h-[5px] cursor-pointer rounded bg-gray-200"
              style={{ top: "24px" }}
            >
              <div
                className="absolute h-full rounded bg-theme-blue opacity-80"
                style={{
                  left: `${calculatePosition(range.min)}%`,
                  width: `${calculatePosition(range.max) - calculatePosition(range.min)}%`
                }}
              />
              <Thumb position={calculatePosition(range.min)} value={range.min} thumb="min" />
              <Thumb position={calculatePosition(range.max)} value={range.max} thumb="max" />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
