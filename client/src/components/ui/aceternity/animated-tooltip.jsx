"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { useState } from "react";
import { motion } from "framer-motion";

export const AnimatedTooltip = ({ items }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div className="flex flex-row items-center justify-center gap-2 py-2">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="relative group"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden group-hover:scale-110 transition-transform">
            <Image
              src={item.image}
              alt={item.name}
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          </div>

          {hoveredIndex === idx && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute -top-14 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-black/80 text-white text-xs rounded-md z-50 whitespace-nowrap"
            >
              <div className="font-bold">{item.name}</div>
              <div className="text-xs">{item.designation}</div>
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
};