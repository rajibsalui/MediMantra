'use client';

import { useState } from 'react';
import { locations } from '../../data/mockData';

export default function LocationSelector({ onLocationChange }) {
  const [selectedLocation, setSelectedLocation] = useState('');

  const handleLocationChange = (e) => {
    const location = e.target.value;
    setSelectedLocation(location);
    if (typeof onLocationChange === 'function') {
      onLocationChange(location);
    }
  };

  return (
    <div className="flex flex-col">
      <label htmlFor="test-location" className="text-sm font-medium text-gray-700 mb-1">
        Test Location
      </label>
      <select
        id="test-location"
        value={selectedLocation}
        onChange={handleLocationChange}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        required
      >
        <option value="">Select a location</option>
        {locations.map((location) => (
          <option key={location.id} value={location.name}>
            {location.name} - {location.address}
          </option>
        ))}
      </select>
      {selectedLocation && (
        <p className="text-xs text-gray-500 mt-1">
          Address details will be sent in your confirmation email.
        </p>
      )}
    </div>
  );
}
