'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ConfirmationModal({ bookingDetails, onClose }) {
  // Close on escape key press
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [onClose]);

  if (!bookingDetails) return null;

  const { test, name, email, phone, date, time, location } = bookingDetails;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-green-600">Booking Confirmed!</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <p className="text-green-700 mb-1">Your lab test has been successfully booked.</p>
            <p className="text-green-700 text-sm">A confirmation has been sent to your email.</p>
          </div>

          <div className="space-y-3 mb-6">
            <h3 className="font-semibold text-lg text-gray-800">Booking Details</h3>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="text-gray-500">Test:</span>
              <span className="col-span-2 font-medium">{test.name}</span>

              <span className="text-gray-500">Patient:</span>
              <span className="col-span-2">{name}</span>

              <span className="text-gray-500">Date:</span>
              <span className="col-span-2">{date}</span>

              <span className="text-gray-500">Time:</span>
              <span className="col-span-2">{time}</span>

              <span className="text-gray-500">Location:</span>
              <span className="col-span-2">{location}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
