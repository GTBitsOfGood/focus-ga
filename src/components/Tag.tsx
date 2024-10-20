import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type TagProps = {
    className?: string;
    text: string;
    isClickable?: boolean;
  };
  
export default function Tag(props: TagProps) {
  return (
    <div className={cn(
      "rounded-full text-sm text-theme-gray py-0.5 bg-[#D6F4F4] outline outline-1 outline-[#3AC0C1] flex items-center",
      props.className,
      props.isClickable ? "pl-4 pr-2 cursor-pointer" : "px-4"
    )}>
      {props.text}
      {props.isClickable && <X className="w-3 h-3 ml-2" />}
    </div>
  );
}