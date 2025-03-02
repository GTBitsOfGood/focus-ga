'use client'

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
  const minThumbRef = useRef<HTMLDivElement>(null);
  const maxThumbRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<string | null>(null);

  useEffect(() => {
    onChange(currentMinAge, currentMaxAge);
  }, [currentMinAge, currentMaxAge]);

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
    // Calculate age from percentage position
    const rawAge = Math.round(((position / 100) * (maxAge - minAge)) + minAge);
    // Ensure the result is within bounds
    return Math.max(minAge, Math.min(maxAge, rawAge));
  };

  const handlePointerDown = (e: React.PointerEvent, thumb: string) => {
    e.preventDefault();
    isDraggingRef.current = thumb;
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDraggingRef.current || !sliderRef.current) return;
    
    const slider = sliderRef.current;
    const rect = slider.getBoundingClientRect();
    const position = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    
    if (isDraggingRef.current === 'min') {
      const newAge = calculateAge(position);
      setCurrentMinAge(Math.min(newAge, currentMaxAge));
    } else if (isDraggingRef.current === 'max') {
      const newAge = calculateAge(position);
      setCurrentMaxAge(Math.max(newAge, currentMinAge));
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = null;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  };

  const handleSliderClick = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    
    const slider = sliderRef.current;
    const rect = slider.getBoundingClientRect();
    const position = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const clickedAge = calculateAge(position);
    
    const minDistance = Math.abs(clickedAge - currentMinAge);
    const maxDistance = Math.abs(clickedAge - currentMaxAge);
    
    if (minDistance <= maxDistance) {
      setCurrentMinAge(Math.min(clickedAge, currentMaxAge));
    } else {
      setCurrentMaxAge(Math.max(clickedAge, currentMinAge));
    }
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

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
            Age
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
          <div className="relative h-10 pt-4">
            <div 
              ref={sliderRef} 
              className="absolute inset-0 h-2 bg-gray-200 rounded cursor-pointer" 
              onClick={handleSliderClick}
            >
              <div 
                className="absolute h-full bg-blue-500 rounded"
                style={{ 
                  left: `${Math.max(0, minPosition)}%`, 
                  width: `${maxPosition - Math.max(0, minPosition)}%` 
                }}
              />
              <div 
                ref={minThumbRef}
                className="absolute w-5 h-5 -mt-1.5 bg-blue-500 rounded-full shadow cursor-grab border-2 border-white z-10"
                style={{ 
                  left: `${minPosition}%`, 
                  transform: 'translateX(-50%)'
                }}
                onPointerDown={(e) => handlePointerDown(e, 'min')}
              />
              <div 
                ref={maxThumbRef}
                className="absolute w-5 h-5 -mt-1.5 bg-blue-500 rounded-full shadow cursor-grab border-2 border-white z-10"
                style={{ 
                  left: `${maxPosition}%`, 
                  transform: 'translateX(-50%)'
                }}
                onPointerDown={(e) => handlePointerDown(e, 'max')}
              />
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 px-1 pt-2">
            <span>{currentMinAge}</span>
            <span>{currentMaxAge === maxAge ? `${maxAge}+` : currentMaxAge}</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
