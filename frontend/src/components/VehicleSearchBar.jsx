import React, { useState, useEffect } from 'react';
import { FaSearch, FaCar, FaFilter, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';

const SearchBar = ({ onSearch, onReset, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    minPrice: '',
    maxPrice: '',
    year: '',
    ...initialFilters
  });

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({
      make: '',
      model: '',
      minPrice: '',
      maxPrice: '',
      year: ''
    });
    onReset();
  };

  const toggleAdvanced = () => {
    setIsAdvancedOpen(!isAdvancedOpen);
  };

  // Common list of car makes for dropdown
  const carMakes = [
    'Toyota', 'Honda', 'Nissan', 'Mitsubishi', 'Mazda', 
    'Suzuki', 'Mercedes-Benz', 'BMW', 'Audi', 'Volkswagen',
    'Ford', 'Chevrolet', 'Hyundai', 'Kia', 'Lexus'
  ];

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Make dropdown */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaCar className="inline mr-2" /> Make
            </label>
            <select 
              name="make"
              value={filters.make}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Any Make</option>
              {carMakes.map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>
          </div>

          {/* Model input */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaCar className="inline mr-2" /> Model
            </label>
            <input
              type="text"
              name="model"
              value={filters.model}
              onChange={handleChange}
              placeholder="Any Model"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Search button */}
          <div className="flex-none self-end">
            <button
              type="submit"
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-150 ease-in-out flex items-center justify-center"
            >
              <FaSearch className="mr-2" /> Search
            </button>
          </div>
        </div>

        {/* Toggle button for advanced filters */}
        <div className="mb-2">
          <button
            type="button"
            onClick={toggleAdvanced}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
          >
            <FaFilter className="mr-1" />
            {isAdvancedOpen ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
          </button>
        </div>

        {/* Advanced search options */}
        {isAdvancedOpen && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 bg-gray-50 p-4 rounded-md">
            {/* Year input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaCalendarAlt className="inline mr-2" /> Year
              </label>
              <input
                type="number"
                name="year"
                value={filters.year}
                onChange={handleChange}
                placeholder="Any Year"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Min price input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaMoneyBillWave className="inline mr-2" /> Min Price (Rs)
              </label>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleChange}
                placeholder="No minimum"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Max price input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaMoneyBillWave className="inline mr-2" /> Max Price (Rs)
              </label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleChange}
                placeholder="No maximum"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Reset button */}
        {(filters.make || filters.model || filters.year || filters.minPrice || filters.maxPrice) && (
          <div className="mt-4 text-right">
            <button
              type="button"
              onClick={handleReset}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
