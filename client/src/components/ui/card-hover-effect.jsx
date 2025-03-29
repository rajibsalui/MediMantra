"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export const HoverEffect = ({ items }) => {
  let [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="relative group block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-100 to-teal-100 opacity-80 rounded-xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <div className="rounded-xl h-full w-full p-6 border border-gray-200 shadow-md relative z-20 bg-white">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-cyan-50 mb-4 text-2xl shadow-sm">
              {item.icon}
            </div>
            <h3 className="font-semibold text-xl mb-2 text-gray-800">{item.title}</h3>
            <p className="text-gray-600 text-sm">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
