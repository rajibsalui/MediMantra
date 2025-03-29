"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

export const BackgroundBeams = ({
  className,
  children,
}) => {
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
  });

  const ref = useRef(null);

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setMousePosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "h-full w-full overflow-hidden [--opacity:0.2] [--line-color:theme(colors.blue.500/20)] [--beam-color:theme(colors.blue.500)]",
        className
      )}
      style={{
        backgroundColor: "#000",
      }}
    >
      <div
        className="absolute left-0 top-0 h-full w-full z-0"
        style={{
          opacity: "var(--opacity)",
          backgroundImage: `
            radial-gradient(
              circle at ${mousePosition.x}px ${mousePosition.y}px,
              var(--beam-color) 0%,
              transparent 20%
            ),
            radial-gradient(
              circle at ${mousePosition.x + 100}px ${mousePosition.y + 100}px,
              var(--beam-color) 0%,
              transparent 40%
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 1px,
              var(--line-color) 1px,
              var(--line-color) 2px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 1px,
              var(--line-color) 1px,
              var(--line-color) 2px
            )
          `,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};