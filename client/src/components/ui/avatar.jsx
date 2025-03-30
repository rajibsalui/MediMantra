"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Avatar({ className, ...props }) {
  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  );
}
Avatar.displayName = "Avatar";

export function AvatarImage({ src, alt = "", className, ...props }) {
  return (
    <div className={cn("aspect-square h-full w-full", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          {...props}
        />
      ) : null}
    </div>
  );
}
AvatarImage.displayName = "AvatarImage";

export function AvatarFallback({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-600",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
AvatarFallback.displayName = "AvatarFallback";
