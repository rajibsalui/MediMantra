'use client';

import { motion } from 'framer-motion';

export default function BookingSummary({ test, formData }) {
  if (!test || !formData) {
    return null;
  }

  const { name, email, phone, date, time, location } = formData;

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md p-5 border border-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
        Booking Summary
      </h3>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500">Test Details</h4>
          <p className="font-medium text-gray-800">{test.name}</p>
          <div className="flex items-center mt-1">
            <span className="text-blue-600 font-semibold">${test.price}</span>
            {test.discount > 0 && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded ml-2">
                {test.discount}% off
              </span>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500">Appointment</h4>
          <p className="text-gray-800">
            {date} at {time}
          </p>
          <p className="text-gray-600 text-sm">{location}</p>
        </div>

        {name && (
          <div>
            <h4 className="text-sm font-medium text-gray-500">Patient Information</h4>
            <p className="text-gray-800">{name}</p>
            <p className="text-gray-600 text-sm">{email}</p>
            <p className="text-gray-600 text-sm">{phone}</p>
          </div>
        )}

        <div className="pt-3 border-t mt-3">
          <div className="flex justify-between">
            <span className="font-medium">Total</span>
            <span className="font-bold text-blue-700">
              ${(test.price * (1 - test.discount / 100)).toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Payment will be collected at the lab
          </p>
        </div>
      </div>
    </motion.div>
  );
}
