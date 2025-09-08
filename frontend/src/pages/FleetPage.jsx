import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VehicleCard from '../components/VehicleCard';
import VehicleSearchBar from '../components/VehicleSearchBar';

const FleetPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    minPrice: '',
    maxPrice: '',
    year: ''
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5001/api/vehicles');
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
      
      const response = await axios.get(`http://localhost:5001/api/vehicles?${queryParams}`);
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
      year: ''
    });
    fetchVehicles();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Our Fleet</h1>
      
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
