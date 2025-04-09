'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/lab-tests/Header';
import TestCategorySelector from '@/components/lab-tests/TestCategorySelector';
import SearchBar from '@/components/lab-tests/SearchBar';
import TestList from '@/components/lab-tests/TestList';
import BookingForm from '@/components/lab-tests/BookingForm';
import ConfirmationModal from '@/components/lab-tests/ConfirmationModal';
import { API_URL, SOCKET_URL } from '@/config/environment';

// This ensures the page is only rendered on the client side
export const dynamic = 'force-dynamic';
export const runtime = 'edge';
export default function LabTests() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTest, setSelectedTest] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };
  
  const handleSearch = (query) => {
    setSearchQuery(query);
  };
  
  const handleTestSelect = (test) => {
    setSelectedTest(test);
  };
  
  const handleBookingSubmit = (details) => {
    setBookingDetails(details);
    setShowConfirmation(true);
  };
  
  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    setSelectedTest(null);
    setBookingDetails(null);
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-blue-50 to-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* <Header /> */}
      
      <main className="container mx-auto px-4 py-6">
        <motion.h1 
          className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Book Your Lab Test
        </motion.h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side - Test Selection */}
          <motion.div 
            className="lg:col-span-2 space-y-5"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="md:w-3/5">
                <TestCategorySelector 
                  selectedCategory={selectedCategory}
                  onCategoryChange={handleCategoryChange}
                />
              </div>
              <div className="md:w-2/5">
                <SearchBar onSearch={handleSearch} />
              </div>
            </div>
            
            <TestList 
              category={selectedCategory}
              searchQuery={searchQuery}
              onTestSelect={handleTestSelect}
            />
          </motion.div>
          
          {/* Right side - Booking Form */}
          <motion.div
            className="lg:col-span-1"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {selectedTest ? (
              <BookingForm 
                test={selectedTest}
                onSubmit={handleBookingSubmit}
              />
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-lg text-center border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Book Your Test</h2>
                <p className="text-gray-500">Select a test from the list to book an appointment.</p>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      
      {showConfirmation && (
        <ConfirmationModal 
          bookingDetails={bookingDetails}
          onClose={handleCloseConfirmation}
        />
      )}
    </motion.div>
  );
}
