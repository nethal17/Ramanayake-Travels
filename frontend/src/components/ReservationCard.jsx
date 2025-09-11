import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaUser, 
  FaCarAlt, 
  FaClock, 
  FaMoneyBillWave, 
  FaPhoneAlt,
  FaEnvelope,
  FaPlay,
  FaStop,
  FaInfoCircle
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { apiPut } from '../utils/apiUtils';
import { useAuth } from '../hooks/useAuth';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200'
};

const ReservationCard = ({ reservation, index, onUpdate }) => {
  const { user } = useAuth();
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const isDriver = user?.role === 'driver';
  
  // Handle undefined reservation prop
  if (!reservation) {
    return (
      <div className="border border-gray-200 rounded-lg shadow-md p-4 bg-gray-50 animate-pulse">
        <div className="h-6 bg-gray-300 rounded mb-4 w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded mb-2 w-1/2"></div>
        <div className="h-4 bg-gray-300 rounded mb-4 w-2/3"></div>
        <div className="h-10 bg-gray-300 rounded"></div>
      </div>
    );
  }
  
  // Handle cancelling reservation
  const handleCancelReservation = async () => {
    try {
      const confirmation = window.confirm('Are you sure you want to cancel this reservation?');
      
      if (!confirmation) return;
      
      await apiPut(`/reservations/${reservation._id}/cancel`);
      
      toast.success('Reservation cancelled successfully');
      
      // Update parent component
      if (onUpdate) {
        onUpdate(reservation._id, 'cancelled');
      }
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel reservation');
    }
  };
  
  // Start trip (for drivers)
  const handleStartTrip = async () => {
    try {
      const confirmation = window.confirm('Are you sure you want to start this trip?');
      
      if (!confirmation) return;
      
      console.log('Starting trip:', reservation._id);
      
      // Update trip status - simplified, no location
      const response = await apiPut(`/reservations/${reservation._id}/trip-status`, {
        status: 'started'
      });
      
      console.log('Trip started response:', response);
      toast.success('Trip started successfully');
      
      // Update parent component
      if (onUpdate) {
        onUpdate(reservation._id, response.reservation.status, 'started');
      }
    } catch (err) {
      console.error('Error starting trip:', err);
      const errorMessage = err.response?.data?.message || 'Failed to start trip';
      
      // Log detailed error information
      if (err.response?.data) {
        console.error('Error details:', err.response.data);
      }
      
      toast.error(errorMessage);
    }
  };
  
  // End trip (for drivers)
  const handleEndTrip = async () => {
    try {
      const confirmation = window.confirm('Are you sure you want to complete this trip?');
      
      if (!confirmation) return;
      
      // Update trip status - simplified, no location
      const response = await apiPut(`/reservations/${reservation._id}/trip-status`, {
        status: 'completed'
      });
      
      console.log('End trip response:', response);
      toast.success('Trip completed successfully');
      
      // Update parent component
      if (onUpdate) {
        onUpdate(reservation._id, 'completed', 'completed');
      }
    } catch (err) {
      console.error('Error completing trip:', err);
      const errorMessage = err.response?.data?.message || 'Failed to complete trip';
      
      // Log detailed error information
      if (err.response?.data) {
        console.error('Error details:', err.response.data);
      }
      
      toast.error(errorMessage);
    }
  };
  
  // Toggle customer details visibility
  const toggleCustomerDetails = () => {
    setShowCustomerDetails(prev => !prev);
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Calculate rental duration in days
  const calculateDuration = () => {
    // Use pickupDate/returnDate or startDate/endDate based on what's available
    const pickup = new Date(reservation.pickupDate || reservation.startDate);
    const returnDate = new Date(reservation.returnDate || reservation.endDate);
    const diffTime = Math.abs(returnDate - pickup);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Handle different data structures (regular reservation vs driver trip)
  const getVehicleData = () => {
    // If it's a trip (from driver endpoint), use vehicle property
    if (reservation.vehicle) {
      return {
        id: reservation.vehicle._id,
        make: reservation.vehicle.name?.split(' ')[0] || '',
        model: reservation.vehicle.name?.split(' ').slice(1).join(' ') || '',
        year: reservation.vehicle.year,
        imageUrl: reservation.vehicle.imageUrl
      };
    }
    
    // Regular reservation uses vehicleId
    if (typeof reservation.vehicleId === 'object') {
      return {
        id: reservation.vehicleId._id,
        make: reservation.vehicleId.make,
        model: reservation.vehicleId.model,
        year: reservation.vehicleId.year,
        imageUrl: reservation.vehicleId.imageUrl
      };
    }
    
    // If vehicleId is just an ID string
    return {
      id: reservation.vehicleId,
      make: '',
      model: 'Vehicle Details Not Available',
      year: '',
      imageUrl: null
    };
  };

  return (
    <motion.div
      className="border border-gray-200 rounded-lg shadow-md overflow-hidden bg-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      {/* Reservation Header */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div>
          <h3 className="font-semibold">Reservation #{reservation._id.substring(0, 8)}...</h3>
          <p className="text-sm text-blue-100">
            <FaClock className="inline mr-1" /> Created: {formatDate(reservation.createdAt || new Date())}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full ${statusColors[reservation.status] || 'bg-gray-100 text-gray-800 border-gray-200'} text-sm font-medium border`}>
          {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
        </div>
      </div>
      
      {/* Reservation Content */}
      <div className="p-4">
        {/* Vehicle Information */}
        <div className="flex items-center mb-4 border-b border-gray-100 pb-3">
          {(() => {
            const vehicle = getVehicleData();
            return (
              <>
                {vehicle.imageUrl ? (
                  <img 
                    src={vehicle.imageUrl} 
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-20 h-16 object-cover rounded mr-4"
                  />
                ) : (
                  <div className="w-20 h-16 bg-gray-200 rounded flex items-center justify-center mr-4">
                    <FaCarAlt className="text-gray-400 text-2xl" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {vehicle.make} {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ''}
                  </h3>
                  <p className="text-blue-600 font-medium">
                    Rs {reservation.totalPrice?.toLocaleString() || 'N/A'} 
                    <span className="text-gray-500 font-normal text-sm"> for {calculateDuration()} days</span>
                  </p>
                </div>
              </>
            );
          })()}
        </div>
        
        {/* Reservation Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="flex items-start">
            <FaCalendarAlt className="text-blue-600 mt-1 mr-2" />
            <div>
              <p className="font-medium text-sm">Pickup Date</p>
              <p className="text-gray-700">{formatDate(reservation.pickupDate || reservation.startDate)}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <FaCalendarAlt className="text-blue-600 mt-1 mr-2" />
            <div>
              <p className="font-medium text-sm">Return Date</p>
              <p className="text-gray-700">{formatDate(reservation.returnDate || reservation.endDate)}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <FaMapMarkerAlt className="text-blue-600 mt-1 mr-2" />
            <div>
              <p className="font-medium text-sm">Pickup Location</p>
              <p className="text-gray-700">{reservation.pickupLocation || 'Not specified'}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <FaMapMarkerAlt className="text-blue-600 mt-1 mr-2" />
            <div>
              <p className="font-medium text-sm">Return Location</p>
              <p className="text-gray-700">{reservation.returnLocation || 'Not specified'}</p>
            </div>
          </div>
        </div>
        
        {/* Driver Info */}
        <div className="mb-4 bg-gray-50 p-3 rounded">
          <div className="flex items-center">
            <FaUser className="text-blue-600 mr-2" />
            <div>
              <p className="font-medium text-sm">Driver Requested</p>
              <p className="text-gray-700">{reservation.driverRequired ? 'Yes' : 'No'}</p>
              {reservation.customer && (
                <p className="text-sm text-gray-600 mt-1">
                  Customer: {reservation.customer.name}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Customer Details (for drivers) */}
        {isDriver && reservation.status === 'confirmed' && (
          <>
            <button
              onClick={toggleCustomerDetails}
              className="mb-4 w-full flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
            >
              <FaInfoCircle className="mr-2" />
              {showCustomerDetails ? 'Hide Customer Details' : 'View Customer Details'}
            </button>
            
            {showCustomerDetails && (
              <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">Customer Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <FaUser className="text-blue-500 mr-2" />
                    <p className="text-gray-700">
                      {reservation.userId?.name || reservation.customer?.name || 'Not available'}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <FaPhoneAlt className="text-blue-500 mr-2" />
                    <p className="text-gray-700">
                      {reservation.userId?.phone || reservation.customer?.phone || 'Not available'}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <FaEnvelope className="text-blue-500 mr-2" />
                    <p className="text-gray-700">
                      {reservation.userId?.email || reservation.customer?.email || 'Not available'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-end mt-2">
          {/* Driver Trip Controls */}
          {isDriver && reservation.status === 'confirmed' && (
            <>
              {(!reservation.tripStatus || reservation.tripStatus === 'pending') && (
                <button 
                  onClick={handleStartTrip}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center"
                >
                  <FaPlay className="mr-1" /> Start Trip
                </button>
              )}
              
              {reservation.tripStatus === 'started' && (
                <button 
                  onClick={handleEndTrip}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm flex items-center"
                >
                  <FaStop className="mr-1" /> End Trip
                </button>
              )}
            </>
          )}
        
          {/* Regular Customer Controls */}
          {!isDriver && reservation.status === 'pending' && (
            <button 
              onClick={handleCancelReservation}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Cancel Reservation
            </button>
          )}
          
          <Link 
            to={`/fleet/vehicles/${getVehicleData().id}`}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            View Vehicle
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ReservationCard;
