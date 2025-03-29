"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
}) => {
  return (
    <div
      className={cn(
        "relative p-[2px] group overflow-hidden rounded-lg",
        containerClassName
      )}
    >
      <div
        className={cn(
          "absolute inset-0 rounded-lg z-[1] transition-all duration-300",
          animate && "group-hover:opacity-100 opacity-80",
          "bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500"
        )}
      />
      <div
        className={cn(
          "relative z-[2] rounded-lg h-full w-full",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};
