"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const TextGenerateEffect = ({ words, className }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < words.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + words[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 15); // Adjust speed as needed

      return () => clearTimeout(timeout);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, words]);

  return (
    <div className={className}>
      <p className="mt-4">
        {displayedText}
        {!isComplete && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className="inline-block ml-1"
          >
            |
          </motion.span>
        )}
      </p>
    </div>
  );
};
