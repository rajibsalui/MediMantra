'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function SearchBar({ onSearch }) {
  const [inputValue, setInputValue] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(inputValue);
  };
  
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    // Optional: Real-time search as user types
    onSearch(value);
  };
  
  return (
    <motion.form 
      className="w-full h-full"
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <div className="relative h-full">
        <input
          type="text"
          placeholder="Search for tests..."
          value={inputValue}
          onChange={handleInputChange}
          className="w-full h-full pl-10 pr-12 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white shadow-sm"
        />
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <motion.button 
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-md transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Search"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </div>
    </motion.form>
  );
}
