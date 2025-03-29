'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

export default function SymptomForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    symptoms: '',
    duration: '',
    onsetDate: null,
    medicalHistory: '',
    currentMedications: '',
    reportFile: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, onsetDate: date }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, reportFile: e.target.files[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="relative w-full py-12 px-4">
      {/* Background elements */}
      <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-blue-50 to-indigo-100 opacity-50 -z-10"></div>
      <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#ffffff20_1px,transparent_1px),linear-gradient(to_bottom,#ffffff20_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_40%,transparent_100%)] -z-10"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.8,
          type: "spring",
          stiffness: 100 
        }}
        className="max-w-4xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 md:p-10 border border-white/20"
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">Health Information</h2>
          <p className="text-gray-500 mt-2">Please provide your medical information for accurate analysis</p>
        </motion.div>
        
        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm"
                required
              />
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm"
                required
              />
            </motion.div>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all duration-200 appearance-none bg-white/50 backdrop-blur-sm"
              required
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">Describe Your Symptoms</label>
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm resize-none"
              required
              placeholder="Please describe your symptoms in detail..."
            ></textarea>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">Symptom Onset Date</label>
            <div className="border border-gray-200 rounded-xl p-2 shadow-sm bg-white/70 backdrop-blur-sm overflow-hidden">
              <Calendar
                mode="single"
                selected={formData.onsetDate}
                onSelect={handleDateChange}
                disabled={(date) => date > new Date()}
                className="w-full"
              />
            </div>
            <AnimatePresence>
              {formData.onsetDate && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 text-sm text-gray-600 flex items-center"
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                  Selected date: {format(formData.onsetDate, 'PPP')}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">How long have you experienced these symptoms?</label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              placeholder="e.g., 3 days, 2 weeks"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm"
            />
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">Medical History</label>
              <textarea
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleInputChange}
                rows="3"
                placeholder="List any relevant medical conditions..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm resize-none"
              ></textarea>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Medications</label>
              <textarea
                name="currentMedications"
                value={formData.currentMedications}
                onChange={handleInputChange}
                rows="3"
                placeholder="List any medications you're currently taking..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm resize-none"
              ></textarea>
            </motion.div>
          </div>
          
          <motion.div 
            className="border-t border-gray-200 pt-7"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Medical Reports (optional)</label>
            <div className="group relative flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl transition-all duration-300 hover:border-blue-500 bg-white/50 hover:bg-blue-50/50">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                onChange={handleFileChange} 
                accept=".pdf,.jpg,.jpeg,.png" 
              />
              <div className="space-y-2 text-center">
                <div className="mx-auto h-14 w-14 text-gray-400 group-hover:text-blue-500 transition-colors duration-300">
                  <svg stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">Click to upload</span>
                  <span className="text-sm text-gray-500 ml-1">or drag and drop</span>
                </div>
                <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
              </div>
            </div>
            <AnimatePresence>
              {formData.reportFile && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center"
                >
                  <div className="w-8 h-8 flex-shrink-0 text-blue-500">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="ml-3 text-sm text-blue-800">
                    File selected: <span className="font-medium">{formData.reportFile.name}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              className="group relative px-8 py-4 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>Analyze Symptoms</span>
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </span>
              <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <span className="absolute bottom-0 right-0 -mb-3 -mr-3 h-20 w-20 rounded-full blur-lg bg-violet-400 opacity-50 group-hover:opacity-100 transition-opacity"></span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
