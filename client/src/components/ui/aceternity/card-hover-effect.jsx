import React from "react";
import { cn } from "@/lib/utils";

export const CardHoverEffect = ({ className, children }) => {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border border-gray-200 bg-white hover:shadow-lg transition-all duration-300",
        className
      )}
    >
      {children}
    </div>
  );
};