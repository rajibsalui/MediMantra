"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export const AnimatedTooltip = ({ items }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {items.map((item, idx) => (
        <div
          key={item.id || idx}
          className="relative group"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div className="cursor-pointer relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: idx * 0.1 }}
            >
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md relative">
                <Image
                  src={item.image || "/placeholder-patient.png"}
                  alt={item.name || "User"}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
          
          {hoveredIndex === idx && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-10"
            >
              <div className="bg-white rounded-md shadow-md px-4 py-2 w-36 text-center">
                <p className="font-medium text-sm">{item.name}</p>
                {item.designation && (
                  <p className="text-xs text-gray-500">{item.designation}</p>
                )}
              </div>
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
};
