import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type TagProps = {
    className?: string;
    text: string;
    isClickable?: boolean;
    onClick?: () => void; 
  };
  
export default function Tag(props: TagProps) {
  return (
    <div className={cn(
      "rounded-full text-sm text-theme-gray py-0.5 bg-theme-light outline outline-1 outline-theme-accent flex items-center",
      props.className,
      props.isClickable ? "pl-4 pr-2 cursor-pointer" : "px-4"
    )}
      onClick={props.isClickable ? props.onClick : undefined}
      >
      {props.text}
      {props.isClickable && <X className="w-3 h-3 ml-2" />}
    </div>
  );
}