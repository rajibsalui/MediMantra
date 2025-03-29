'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TestCard from './TestCard';
import { labTests } from '../../data/mockData';

export default function TestList({ category, searchQuery, onTestSelect }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load tests data from mock data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      // Filter based on category and search
      let filteredTests = labTests;
      
      if (category !== 'All') {
        filteredTests = filteredTests.filter(test => test.category === category);
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredTests = filteredTests.filter(test => 
          test.name.toLowerCase().includes(query) || 
          test.description.toLowerCase().includes(query)
        );
      }
      
      setTests(filteredTests);
      setLoading(false);
    }, 600); // Simulate API delay
  }, [category, searchQuery]);
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  return (
    <div className="mt-4">
      {loading ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-md h-48 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="mt-6 flex justify-between items-center">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </motion.div>
      ) : (
        <>
          {tests.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {tests.map((test) => (
                <TestCard 
                  key={test.id} 
                  test={test} 
                  onSelect={() => onTestSelect(test)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-700 mb-1">No tests found</h3>
              <p className="text-gray-500">Try changing your search or category filters</p>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
