"use client";
import React, { useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { motion } from "framer-motion";

export const StickyScroll = ({ content }) => {
  const [activeCard, setActiveCard] = useState(0);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    container: ref,
    offset: ["start start", "end start"],
  });
  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, i) => i / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, i) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return i;
        }
        return acc;
      },
      0
    );
    setActiveCard(closestBreakpointIndex);
  });

  return (
    <motion.div
      ref={ref}
      className="h-full overflow-y-auto flex justify-center scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent"
    >
      <div className="w-full max-w-5xl flex flex-col gap-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-[30rem] sticky top-0 pt-10">
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              key={activeCard}
              className="h-full w-full rounded-2xl shadow-lg overflow-hidden"
            >
              {content[activeCard].content}
            </motion.div>
          </div>
          <div className="py-10">
            {content.map((item, idx) => (
              <div
                key={idx}
                className="mb-16 h-[30vh] md:h-[40vh] flex flex-col justify-center"
              >
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: activeCard === idx ? 1 : 0.5,
                  }}
                  className="text-2xl font-bold text-gray-800"
                >
                  {item.title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: activeCard === idx ? 1 : 0.5,
                  }}
                  className="text-gray-600 max-w-sm mt-4"
                >
                  {item.description}
                </motion.p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
