"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, ChevronUp } from "lucide-react";
import cn from "classnames";

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
  minAge = 0,
  maxAge = 20,
  onChange,
  initialMinAge = 0,
  initialMaxAge = 20,
}: AgeFilterProps) {
  const [showPopover, setShowPopover] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const [currentMinAge, setCurrentMinAge] = useState(initialMinAge);
  const [currentMaxAge, setCurrentMaxAge] = useState(initialMaxAge);

  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<string | null>(null);

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
    return Math.max(minAge, Math.min(maxAge, Math.round(((position / 100) * (maxAge - minAge)) + minAge)));
  };

  const handlePointerDown = (e: React.PointerEvent, thumb: string) => {
    e.preventDefault();
    isDraggingRef.current = thumb;
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDraggingRef.current || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const position = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));

    if (isDraggingRef.current === 'min') {
      setCurrentMinAge(Math.min(calculateAge(position), currentMaxAge) === 20 ? 19 : Math.min(calculateAge(position), currentMaxAge));
    } else {
      setCurrentMaxAge(Math.max(calculateAge(position), currentMinAge) === 0 ? 1 : Math.max(calculateAge(position), currentMinAge));
    }
  };

  const handlePointerUp = () => {
    onChange(currentMinAge, currentMaxAge);
    isDraggingRef.current = null;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  };

  const minPosition = calculatePosition(currentMinAge);
  const maxPosition = calculatePosition(currentMaxAge);

  return (
    <Popover onOpenChange={debounceOpenDropdown} open={showPopover}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "relative flex items-center justify-center rounded-full cursor-pointer bg-dropdown-gray py-1 px-3 hover:bg-gray-200 transition",
            { "pointer-events-none": isDisabled },
            { "bg-gray-200": showPopover }
          )}
        >
          <div className="text-black text-sm font-normal">
            {label}
          </div>

          {!showPopover ? (
            <ChevronDown className="w-4 h-4 ml-1" color="black" />
          ) : (
            <ChevronUp className="w-4 h-4 ml-1" color="black" />
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-[300px] p-5 shadow-lg rounded-md">
        <div className="space-y-5">
          <h3 className="text-base font-medium text-gray-700">Range for age filter</h3>
          <div className="relative h-16 pt-6">
            <div
              ref={sliderRef}
              className="absolute inset-x-0 h-[5px] bg-gray-200 rounded cursor-pointer"
              style={{ top: "24px" }}
            >
              <div
                className="absolute h-full bg-theme-blue rounded"
                style={{
                  left: `${Math.max(0, minPosition)}%`,
                  width: `${maxPosition - Math.max(0, minPosition)}%`
                }}
              />
              <div className="absolute flex flex-col items-center" style={{
                left: `${minPosition}%`,
                transform: 'translateX(-50%)',
                top: "-25px",
              }}>
                <span className="text-xs text-gray-600 mb-1">{currentMinAge}</span>
                <div
                  className="w-4 h-4 -mb-1.5 bg-theme-blue rounded-full shadow cursor-grab z-10"
                  onPointerDown={(e) => handlePointerDown(e, 'min')}
                />
              </div>
              <div className="absolute flex flex-col items-center" style={{
                left: `${maxPosition}%`,
                transform: 'translateX(-50%)',
                top: "-25px",
              }}>
                <span className="text-xs text-gray-600 mb-1">{currentMaxAge === maxAge ? `${maxAge}+` : currentMaxAge}</span>
                <div
                  className="w-4 h-4 -mb-1.5 bg-theme-blue rounded-full shadow cursor-grab z-10"
                  onPointerDown={(e) => handlePointerDown(e, 'max')}
                />
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}