'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { labTests } from '../../data/mockData';

export default function TestCategorySelector({ selectedCategory, onCategoryChange }) {
  // Extract unique categories from lab tests data
  const categories = useMemo(() => {
    const uniqueCategories = new Set(labTests.map(test => test.category));
    return ['All', ...Array.from(uniqueCategories).sort()];
  }, []);
  
  return (
    <div className="overflow-x-auto pb-2 testcatergory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="flex testcatergory gap-2 min-w-max">
        {categories.map((category, index) => (
          <motion.button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {category}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
