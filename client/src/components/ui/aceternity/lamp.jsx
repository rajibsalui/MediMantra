"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const LampContainer = ({
  children,
  className,
  width = "w-full",
  height = "h-full",
}) => {
  const containerRef = useRef(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const mouse = useRef({ x: 0, y: 0 });
  const containerSize = useRef({ w: 0, h: 0 });
  const [cursorMoved, setCursorMoved] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      containerSize.current.w = rect.width;
      containerSize.current.h = rect.height;
    }

    const handleMouseMove = (ev) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const { w, h } = containerSize.current;
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;
        mousePosition.current.x = x;
        mousePosition.current.y = y;
        setCursorMoved(true);
      }
    };

    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        containerSize.current.w = rect.width;
        containerSize.current.h = rect.height;
      }
    };
    
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const animateLight = () => {
      if (!cursorMoved) {
        // Default position in the middle if cursor hasn't moved
        mouse.current.x = containerSize.current.w / 2;
        mouse.current.y = containerSize.current.h / 2;
      } else {
        // Smoothly move toward the cursor position
        mouse.current.x += (mousePosition.current.x - mouse.current.x) * 0.1;
        mouse.current.y += (mousePosition.current.y - mouse.current.y) * 0.1;
      }

      if (containerRef.current) {
        const xPercentage = (mouse.current.x / containerSize.current.w) * 100;
        const yPercentage = (mouse.current.y / containerSize.current.h) * 100;
        
        // Radial gradient follows the cursor
        containerRef.current.style.setProperty("--x", `${xPercentage}%`);
        containerRef.current.style.setProperty("--y", `${yPercentage}%`);
      }

      requestAnimationFrame(animateLight);
    };

    const animationFrame = requestAnimationFrame(animateLight);
    return () => cancelAnimationFrame(animationFrame);
  }, [cursorMoved]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden rounded-md",
        className
      )}
      style={{
        "--x": "50%",
        "--y": "50%",
      }}
    >
      <div className="relative z-10 w-full">{children}</div>
      <div className="absolute inset-0 z-0">
        {/* Lamp gradient */}
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-800 to-cyan-500 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
        
        {/* Lamp light effect */}
        <div
          className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
          style={{
            opacity: 0.8,
            background: `radial-gradient(700px circle at var(--x) var(--y), rgb(29, 78, 216, 0.15), transparent 70%)`,
          }}
        />
        
        {/* Lamp bottom gradient */}
        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-blue-900 to-indigo-600 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
      </div>
    </div>
  );
};
