import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VehicleCard from '../components/VehicleCard';
import VehicleSearchBar from '../components/VehicleSearchBar';
import { FaCar, FaShuttleVan, FaBusAlt, FaFilter } from 'react-icons/fa';

const FleetPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    minPrice: '',
    maxPrice: '',
    year: '',
    fuelType: '',
    transmission: '',
    minSeats: '',
    maxDoors: ''
  });
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5001/api/vehicles/search');
      setVehicles(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load vehicles. Please try again later.');
      setLoading(false);
      console.error('Error fetching vehicles:', err);
    }
  };

  const handleSearch = async (searchParams) => {
    try {
      setLoading(true);
      setFilters(searchParams);
      
      // Build query string from search params
      const queryParams = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await axios.get(`http://localhost:5001/api/vehicles/search?${queryParams}`);
      setVehicles(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to search vehicles. Please try again later.');
      setLoading(false);
      console.error('Error searching vehicles:', err);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      make: '',
      model: '',
      minPrice: '',
      maxPrice: '',
      year: '',
      fuelType: '',
      transmission: '',
      minSeats: '',
      maxDoors: ''
    });
    setActiveCategory('all');
    fetchVehicles();
  };
  
  // Filter vehicles by type (car, van, bus)
  const filterByType = (type) => {
    setActiveCategory(type);
    
    if (type === 'all') {
      fetchVehicles();
      return;
    }
    
    // Filter vehicles locally based on type
    setLoading(true);
    
    const filteredVehicles = vehicles.filter(vehicle => {
      const combined = (vehicle.make + ' ' + vehicle.model).toLowerCase();
      
      if (type === 'car' && !combined.includes('bus') && !combined.includes('van') && 
          !combined.includes('coach') && !combined.includes('hiace')) {
        return true;
      }
      
      if (type === 'van' && (combined.includes('van') || combined.includes('hiace'))) {
        return true;
      }
      
      if (type === 'bus' && (combined.includes('bus') || combined.includes('coach'))) {
        return true;
      }
      
      return false;
    });
    
    setVehicles(filteredVehicles);
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Our Fleet</h1>
      
      {/* Vehicle type categories */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <button
          onClick={() => filterByType('all')}
          className={`px-4 py-2 rounded-full flex items-center gap-2 transition-colors ${
            activeCategory === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <FaFilter /> All Vehicles
        </button>
        <button
          onClick={() => filterByType('car')}
          className={`px-4 py-2 rounded-full flex items-center gap-2 transition-colors ${
            activeCategory === 'car' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <FaCar /> Cars
        </button>
        <button
          onClick={() => filterByType('van')}
          className={`px-4 py-2 rounded-full flex items-center gap-2 transition-colors ${
            activeCategory === 'van' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <FaShuttleVan /> Vans
        </button>
        <button
          onClick={() => filterByType('bus')}
          className={`px-4 py-2 rounded-full flex items-center gap-2 transition-colors ${
            activeCategory === 'bus' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <FaBusAlt /> Buses
        </button>
      </div>
      
      <div className="mb-8">
        <VehicleSearchBar 
          onSearch={handleSearch} 
          onReset={handleResetFilters}
          initialFilters={filters}
        />
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-4 bg-red-100 rounded-md">
          {error}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center p-8 bg-gray-100 rounded-md">
          <p className="text-lg text-gray-600">No vehicles found matching your criteria.</p>
          <button 
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map(vehicle => (
            <VehicleCard key={vehicle._id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FleetPage;
