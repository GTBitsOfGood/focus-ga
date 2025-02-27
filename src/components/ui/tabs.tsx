"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center text-neutral-500 dark:text-neutral-400",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    size?: "large" | "base";
  }
>(({ className, size = "large", ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative inline-flex items-center justify-center whitespace-nowrap rounded-md transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
      "mr-[70px]",
      size === "large"
        ? "text-[22px] font-bold normal-case text-black"
        : "text-base font-normal text-[#7D7E82] data-[state=active]:text-black",
      "data-[state=active]:after:absolute data-[state=active]:after:-bottom-1 data-[state=active]:after:left-0 data-[state=active]:after:block data-[state=active]:after:w-full data-[state=active]:after:content-['']",
      size === "large"
        ? "data-[state=active]:after:h-1 data-[state=active]:after:bg-theme-blue"
        : "data-[state=active]:after:h-[2px] data-[state=active]:after:bg-theme-blue",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("mt-2 w-full focus-visible:outline-none", className)}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
