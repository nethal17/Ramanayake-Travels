import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaArrowLeft, 
  FaCalendarAlt, 
  FaCar, 
  FaMoneyBillWave, 
  FaUser, 
  FaMapMarkerAlt, 
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp 
} from 'react-icons/fa';
import ReservationForm from '../components/ReservationForm';

const VehicleDetailsPage = () => {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReservationForm, setShowReservationForm] = useState(false);

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5001/api/vehicles/${id}`);
        setVehicle(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load vehicle details. Please try again later.');
        setLoading(false);
        console.error('Error fetching vehicle details:', err);
      }
    };

    fetchVehicleDetails();
  }, [id]);

  // Format price with commas
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  // Function to determine availability status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'text-green-600 bg-green-100';
      case 'rented':
        return 'text-orange-600 bg-orange-100';
      case 'maintenance':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500 text-center p-4 bg-red-100 rounded-md">
          {error || 'Vehicle not found'}
        </div>
        <div className="mt-4 text-center">
          <Link to="/fleet" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <FaArrowLeft className="mr-2" /> Back to Fleet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link to="/fleet" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <FaArrowLeft className="mr-2" /> Back to Fleet
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Vehicle Image */}
        <div className="w-full md:w-2/3 mx-auto h-48 md:h-64 bg-gray-200 relative">
          {vehicle.imageUrl ? (
            <img 
              src={vehicle.imageUrl} 
              alt={`${vehicle.make} ${vehicle.model}`} 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <FaCar className="text-gray-400 text-5xl" />
            </div>
          )}
          
          {/* Status Badge */}
          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full ${getStatusColor(vehicle.status)} font-medium text-sm`}>
            {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {vehicle.make} {vehicle.model}
          </h1>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center text-gray-600">
              <FaCalendarAlt className="mr-2" />
              <span>{vehicle.year}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <FaUser className="mr-2" />
              <span>{vehicle.ownership} Owned</span>
            </div>
            <div className="flex items-center text-green-600 font-semibold">
              <FaMoneyBillWave className="mr-2" />
              <span>Rs {formatPrice(vehicle.price)}/day</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-gray-700 leading-relaxed">
              {vehicle.description}
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold mb-4">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center">
                <FaCheckCircle className="text-green-500 mr-2" />
                <span>Air Conditioning</span>
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="text-green-500 mr-2" />
                <span>Bluetooth Connectivity</span>
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="text-green-500 mr-2" />
                <span>Power Steering</span>
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="text-green-500 mr-2" />
                <span>GPS Navigation</span>
              </div>
            </div>
          </div>

          {/* Book Now Button */}
          {vehicle.status === 'available' && (
            <div className="mt-8">
              <button
                onClick={() => setShowReservationForm(!showReservationForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md flex items-center justify-center w-full md:w-auto"
              >
                {showReservationForm ? 'Hide Booking Form' : 'Book Now'}
                {showReservationForm ? (
                  <FaChevronUp className="ml-2" />
                ) : (
                  <FaChevronDown className="ml-2" />
                )}
              </button>
              
              {showReservationForm && (
                <div className="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50">
                  <ReservationForm vehicle={vehicle} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsPage;
