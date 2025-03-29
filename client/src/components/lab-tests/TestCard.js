'use client';

import { motion } from 'framer-motion';

export default function TestCard({ test, onSelect }) {
  const item = {
    hidden: { y: 20, opacity: 1 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
      variants={item}
      whileHover={{ y: -5 }}
      layoutId={`test-card-${test.id}`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800">{test.name}</h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {test.category}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4">{test.description}</p>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-gray-500 text-sm">Results in: </span>
            <span className="font-medium">{test.turnaroundTime}</span>
          </div>
          <div className="flex items-center gap-2">
            {test.discount > 0 ? (
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-500 line-through">${test.price}</span>
                <span className="font-bold text-gray-800">
                  ${(test.price * (1 - test.discount / 100)).toFixed(2)}
                  <span className="ml-1 text-xs text-green-600 font-medium">{test.discount}% off</span>
                </span>
              </div>
            ) : (
              <span className="font-bold text-gray-800">${test.price}</span>
            )}
            <motion.button
              onClick={() => onSelect(test)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-4 rounded-md text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Book
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
