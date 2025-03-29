"use client";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";

export const MovingBorder = ({
  children,
  duration = 2000,
  className,
  borderRadius = "1rem",
  ...props
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newX = Math.random() * 100;
      const newY = Math.random() * 100;
      setPosition({ x: newX, y: newY });
    }, duration);

    return () => clearInterval(intervalId);
  }, [duration]);

  return (
    <div
      className={cn(
        "relative overflow-hidden p-[1px] bg-gradient-to-r from-blue-500 to-purple-500",
        className
      )}
      style={{
        borderRadius,
        backgroundPosition: `${position.x}% ${position.y}%`,
        transition: `background-position ${duration}ms ease`,
        backgroundSize: "200% 200%"
      }}
      {...props}
    >
      {children}
    </div>
  );
};