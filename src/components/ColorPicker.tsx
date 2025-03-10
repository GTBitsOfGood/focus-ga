import useClickOff from "@/hooks/useClickOff";
import { ProfileColors } from "@/utils/consts"
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Palette } from "lucide-react";
import { useRef, useState } from "react";

type ColorPickerProps = {
  handleColorPick: (color: ProfileColors) => void;
}

export default function ColorPicker(props: ColorPickerProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  return (
    <div className="absolute bottom-1 right-1">
      <Popover>
        <PopoverTrigger asChild className="cursor-pointer" onClick={() => (setShowColorPicker(true))}>
          <Palette className="text-theme-gray"/>
        </PopoverTrigger>
        {showColorPicker && <PopoverContent align="start" sideOffset={-24}>
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg items-center justify-center z-20 shadow-lg bg-white">
            {Object.values(ProfileColors).map((color) => (
            <div
              key={color}
              className={`rounded-full w-7 h-7 bg-${color} cursor-pointer`}
              onClick={() => (props.handleColorPick(color as ProfileColors), setShowColorPicker(false))}
            ></div>
            ))}
          </div>
        </PopoverContent> }
      </Popover>
    </div>
    
  );
}