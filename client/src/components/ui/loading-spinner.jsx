"use client";

import { cn } from "@/lib/utils";

export default function LoadingSpinner({ size = "md", className }) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
    xl: "h-16 w-16 border-4"
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-solid border-blue-600 border-t-transparent dark:border-blue-400",
          sizeClass
        )}
      />
    </div>
  );
}
