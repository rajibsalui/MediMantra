'use client';

import { useState } from 'react';

export default function DateTimePicker({ onDateTimeChange = () => {} }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  // Generate time slots from 8 AM to 6 PM
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      const hourFormat = hour % 12 === 0 ? 12 : hour % 12;
      const amPm = hour < 12 ? 'AM' : 'PM';
      
      slots.push(`${hourFormat}:00 ${amPm}`);
      if (hour < 18) {
        slots.push(`${hourFormat}:30 ${amPm}`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];

  // Handle date change
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setDate(newDate);
    if (time && typeof onDateTimeChange === 'function') {
      onDateTimeChange({
        date: newDate,
        time: time,
        dateTime: `${newDate} ${time}`
      });
    }
  };

  // Handle time change
  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    setTime(newTime);
    if (date && typeof onDateTimeChange === 'function') {
      onDateTimeChange({
        date: date,
        time: newTime,
        dateTime: `${date} ${newTime}`
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <label htmlFor="appointment-date" className="text-sm font-medium text-gray-700 mb-1">
          Appointment Date
        </label>
        <input
          id="appointment-date"
          type="date"
          min={today}
          value={date}
          onChange={handleDateChange}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      
      <div className="flex flex-col">
        <label htmlFor="appointment-time" className="text-sm font-medium text-gray-700 mb-1">
          Appointment Time
        </label>
        <select
          id="appointment-time"
          value={time}
          onChange={handleTimeChange}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
          disabled={!date}
        >
          <option value="">Select a time</option>
          {timeSlots.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>
        {!date && (
          <p className="text-xs text-gray-500 mt-1">Please select a date first</p>
        )}
      </div>
    </div>
  );
}
