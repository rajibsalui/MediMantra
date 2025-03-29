'use client';

import { motion } from 'framer-motion';

export default function ResultsDisplay({ results, onReset }) {
  const getRiskColor = (risk) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden"
    >
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <h2 className="text-2xl font-bold">Analysis Results</h2>
        <p className="opacity-80">Based on the information you provided</p>
      </div>
      
      <div className="p-6">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <motion.div variants={item} className="border-b pb-4">
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Potential Diagnosis</h3>
            <p className="text-gray-700">{results.diagnosis}</p>
          </motion.div>
          
          <motion.div variants={item}>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Risk Level</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(results.riskLevel)}`}>
              {results.riskLevel}
            </span>
          </motion.div>
          
          <motion.div variants={item}>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Recommendations</h3>
            <ul className="list-disc pl-5 space-y-1">
              {results.recommendations.map((rec, index) => (
                <li key={index} className="text-gray-700">{rec}</li>
              ))}
            </ul>
          </motion.div>
          
          {results.additionalTests && results.additionalTests.length > 0 && (
            <motion.div variants={item}>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Suggested Tests</h3>
              <ul className="list-disc pl-5 space-y-1">
                {results.additionalTests.map((test, index) => (
                  <li key={index} className="text-gray-700">{test}</li>
                ))}
              </ul>
            </motion.div>
          )}
          
          <motion.div variants={item} className="pt-4 border-t">
            <p className="text-gray-500 text-sm mb-4">
              <strong>Disclaimer:</strong> This is an AI-generated analysis and should not replace professional medical advice.
              Please consult with a healthcare professional for proper diagnosis and treatment.
            </p>
            
            <div className="flex justify-center mt-6">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onReset}
                className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all"
              >
                Check Another Symptom
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
