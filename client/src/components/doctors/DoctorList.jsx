import React from "react";
import DoctorCard from "./DoctorCard";
import { motion } from "framer-motion";

const DoctorList = ({ doctors }) => {
  if (doctors.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-2xl font-semibold text-gray-700">
          No doctors found matching your search criteria.
        </h3>
        <p className="text-gray-600 mt-2">Please try another search term.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {doctors.map((doctor, index) => (
        <motion.div
          key={doctor.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <DoctorCard doctor={doctor} />
        </motion.div>
      ))}
    </div>
  );
};

export default DoctorList;
