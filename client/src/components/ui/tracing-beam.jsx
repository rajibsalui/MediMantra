"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

export const TracingBeam = ({
  children,
  className,
}) => {
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
  });
  const containerRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);

  const handleScroll = () => {
    setScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleMouseMove = (e) => {
    const container = containerRef.current;
    if (!container) return;
    
    const { left, top } = container.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top + scrollY;
    setMousePosition({ x, y });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative ${className}`}
    >
      {/* Beam */}
      <motion.div
        className="absolute h-[600px] w-[2px] bg-gradient-to-b from-blue-600 via-blue-400/30 to-transparent"
        animate={{
          x: mousePosition.x,
          height: scrollY > 0 ? "300px" : "600px",
          opacity: scrollY > 0 ? 0.3 : 0.6,
        }}
        transition={{ 
          type: "spring", 
          damping: 10, 
          stiffness: 50, 
          mass: 0.1 
        }}
      />
      
      {/* Circle */}
      <motion.div
        className="absolute h-16 w-16 rounded-full bg-blue-100 blur-xl"
        animate={{
          x: mousePosition.x - 32,
          y: mousePosition.y - 32,
          opacity: scrollY > 0 ? 0.1 : 0.2,
        }}
        transition={{ 
          type: "spring", 
          damping: 10, 
          stiffness: 50, 
          mass: 0.1
        }}
      />
      
      {children}
    </div>
  );
}
