import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import VehicleCard from '../components/VehicleCard';
import LoadingSpinner from '../components/LoadingSpinner';

const FleetPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5001/api/vehicles');
        setVehicles(response.data);
        setFilteredVehicles(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load vehicles. Please try again later.');
        setLoading(false);
        console.error('Error fetching vehicles:', err);
      }
    };

    fetchVehicles();
  }, []);

  useEffect(() => {
    // Apply search and sort
    let result = [...vehicles];
    
    // Search
    if (searchTerm) {
      result = result.filter(vehicle => 
        `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort
    result = sortVehicles(result);
    
    setFilteredVehicles(result);
  }, [vehicles, searchTerm, sortOption, sortDirection]);

  const sortVehicles = (vehiclesToSort) => {
    return [...vehiclesToSort].sort((a, b) => {
      let comparison = 0;
      
      switch (sortOption) {
        case 'name':
          // First compare by make
          comparison = a.make.localeCompare(b.make);
          // If makes are the same, compare by model
          if (comparison === 0) {
            comparison = a.model.localeCompare(b.model);
          }
          break;
        case 'price':
          comparison = a.dailyRate - b.dailyRate;
          break;
        case 'year':
          comparison = a.year - b.year;
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  if (loading) {
    return <LoadingSpinner fullScreen={true} />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500 text-center p-4 bg-red-100 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Our Fleet</h1>
      
      {/* Search and Sort Bar */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search by make or model..."
            className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        
        <div className="flex items-center">
          <select
            value={sortOption}
            onChange={handleSortChange}
            className="p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Make & Model</option>
            <option value="price">Price</option>
            <option value="year">Year</option>
          </select>
          <button
            onClick={toggleSortDirection}
            className="p-3 bg-gray-200 border-y border-r border-gray-300 rounded-r-md hover:bg-gray-300"
          >
            {sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
          </button>
        </div>
      </div>
      
      {/* Results count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredVehicles.length} of {vehicles.length} vehicles
        </p>
      </div>
      
      {/* Vehicle Grid */}
      {filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map(vehicle => (
            <VehicleCard key={vehicle._id} vehicle={vehicle} />
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No vehicles match your criteria.</p>
          <button
            onClick={() => {
              setSearchTerm('');
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
};

export default FleetPage;
