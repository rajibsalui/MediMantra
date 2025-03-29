"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export const BackgroundBeams = ({ className }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  useEffect(() => {
    const updateMousePosition = (e) => {
      const rect = ref.current?.getBoundingClientRect();
      if (rect) {
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener("mousemove", updateMousePosition);
    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`h-full absolute inset-0 [mask-image:radial-gradient(transparent,white)] pointer-events-none ${className}`}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 h-full w-full"
        animate={{
          WebkitMaskPosition: `${mousePosition.x / 1}px ${mousePosition.y / 1}px`,
          WebkitMaskSize: "150px 150px",
          WebkitMaskImage:
            "radial-gradient(circle, black 30%, transparent 70%)",
        }}
        transition={{ type: "spring", bounce: 0.25, damping: 15 }}
      />
    </div>
  );
};
