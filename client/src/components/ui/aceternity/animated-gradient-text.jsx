"use client";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export const AnimatedGradientText = ({
  children,
  className,
  ...props
}) => {
  const gradientRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const rect = gradientRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <span
      ref={gradientRef}
      className={cn(
        "inline-block text-transparent bg-clip-text animate-gradient-xy relative",
        className
      )}
      style={{
        backgroundImage: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, #4f46e5, #3b82f6, #0ea5e9, #06b6d4, #0ea5e9, #3b82f6, #4f46e5)`,
        backgroundSize: "200% 200%",
      }}
      {...props}
    >
      {children}
    </span>
  );
};