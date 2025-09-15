import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const FilterModal = ({ 
  show, 
  onClose, 
  onApply, 
  filters,
  vehicleTypes,
  transmissionTypes,
  fuelTypes,
  priceRange
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  
  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);
  
  // Handle type filter toggle
  const handleTypeToggle = (type) => {
    setLocalFilters(prev => {
      const types = prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type];
      
      return { ...prev, types };
    });
  };
  
  // Handle transmission filter toggle
  const handleTransmissionToggle = (transmission) => {
    setLocalFilters(prev => {
      const transmissions = prev.transmission.includes(transmission)
        ? prev.transmission.filter(t => t !== transmission)
        : [...prev.transmission, transmission];
      
      return { ...prev, transmission: transmissions };
    });
  };
  
  // Handle fuel type filter toggle
  const handleFuelTypeToggle = (fuelType) => {
    setLocalFilters(prev => {
      const fuels = prev.fuelType.includes(fuelType)
        ? prev.fuelType.filter(f => f !== fuelType)
        : [...prev.fuelType, fuelType];
      
      return { ...prev, fuelType: fuels };
    });
  };
  
  // Handle price range change
  const handlePriceChange = (e, field) => {
    const value = parseInt(e.target.value, 10);
    setLocalFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [field]: value
      }
    }));
  };
  
  // Handle apply filters
  const handleApply = () => {
    onApply(localFilters);
  };
  
  // Clear all filters
  const handleClear = () => {
    setLocalFilters({
      types: [],
      priceRange: { min: priceRange.min, max: priceRange.max },
      transmission: [],
      fuelType: [],
    });
  };
  
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Filter Vehicles</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="p-4">
          {/* Vehicle Type Filter */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Vehicle Type</h3>
            <div className="flex flex-wrap gap-2">
              {vehicleTypes.map(type => (
                <button
                  key={type}
                  onClick={() => handleTypeToggle(type)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    localFilters.types.includes(type)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          {/* Price Range Filter */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Price Range (Daily)</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Rs. {localFilters.priceRange.min}</span>
                <span>Rs. {localFilters.priceRange.max}</span>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={localFilters.priceRange.min}
                  onChange={(e) => handlePriceChange(e, 'min')}
                  className="w-full"
                />
                <input
                  type="range"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={localFilters.priceRange.max}
                  onChange={(e) => handlePriceChange(e, 'max')}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          {/* Transmission Filter */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Transmission</h3>
            <div className="flex flex-wrap gap-2">
              {transmissionTypes.map(transmission => (
                <button
                  key={transmission}
                  onClick={() => handleTransmissionToggle(transmission)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    localFilters.transmission.includes(transmission)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {transmission}
                </button>
              ))}
            </div>
          </div>
          
          {/* Fuel Type Filter */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Fuel Type</h3>
            <div className="flex flex-wrap gap-2">
              {fuelTypes.map(fuel => (
                <button
                  key={fuel}
                  onClick={() => handleFuelTypeToggle(fuel)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    localFilters.fuelType.includes(fuel)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {fuel}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t flex justify-between">
          <button
            onClick={handleClear}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Clear All
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;