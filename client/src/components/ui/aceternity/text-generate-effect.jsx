"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({ words, className }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < words.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prevText => prevText + words[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, 20); // Adjust speed as needed

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, words]);

  return (
    <motion.p
      className={cn("font-regular leading-relaxed", className)}
      initial={{ opacity: 0.5, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      {displayedText}
    </motion.p>
  );
};