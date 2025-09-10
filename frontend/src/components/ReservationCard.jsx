import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaUser, 
  FaCarAlt, 
  FaClock, 
  FaMoneyBillWave, 
  FaPhoneAlt 
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200'
};

const ReservationCard = ({ reservation, index }) => {
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

  // Format date to readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Calculate rental duration in days
  const calculateDuration = () => {
    const pickup = new Date(reservation.pickupDate);
    const returnDate = new Date(reservation.returnDate);
    const diffTime = Math.abs(returnDate - pickup);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
            <FaClock className="inline mr-1" /> Created: {formatDate(reservation.createdAt)}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full ${statusColors[reservation.status]} text-sm font-medium border`}>
          {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
        </div>
      </div>
      
      {/* Reservation Content */}
      <div className="p-4">
        {/* Vehicle Information */}
        <div className="flex items-center mb-4 border-b border-gray-100 pb-3">
          {reservation.vehicleDetails?.imageUrl ? (
            <img 
              src={reservation.vehicleDetails.imageUrl} 
              alt={`${reservation.vehicleDetails.make} ${reservation.vehicleDetails.model}`}
              className="w-20 h-16 object-cover rounded mr-4"
            />
          ) : (
            <div className="w-20 h-16 bg-gray-200 rounded flex items-center justify-center mr-4">
              <FaCarAlt className="text-gray-400 text-2xl" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">
              {reservation.vehicleDetails?.make} {reservation.vehicleDetails?.model} ({reservation.vehicleDetails?.year})
            </h3>
            <p className="text-blue-600 font-medium">
              Rs {reservation.totalPrice?.toLocaleString() || 'N/A'} 
              <span className="text-gray-500 font-normal text-sm"> for {calculateDuration()} days</span>
            </p>
          </div>
        </div>
        
        {/* Reservation Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="flex items-start">
            <FaCalendarAlt className="text-blue-600 mt-1 mr-2" />
            <div>
              <p className="font-medium text-sm">Pickup Date</p>
              <p className="text-gray-700">{formatDate(reservation.pickupDate)}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <FaCalendarAlt className="text-blue-600 mt-1 mr-2" />
            <div>
              <p className="font-medium text-sm">Return Date</p>
              <p className="text-gray-700">{formatDate(reservation.returnDate)}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <FaMapMarkerAlt className="text-blue-600 mt-1 mr-2" />
            <div>
              <p className="font-medium text-sm">Pickup Location</p>
              <p className="text-gray-700">{reservation.pickupLocation}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <FaMapMarkerAlt className="text-blue-600 mt-1 mr-2" />
            <div>
              <p className="font-medium text-sm">Return Location</p>
              <p className="text-gray-700">{reservation.returnLocation}</p>
            </div>
          </div>
        </div>
        
        {/* Driver Info */}
        <div className="mb-4 bg-gray-50 p-3 rounded">
          <div className="flex items-center">
            <FaUser className="text-blue-600 mr-2" />
            <div>
              <p className="font-medium text-sm">Driver Requested</p>
              <p className="text-gray-700">{reservation.driverNeeded ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-end mt-2">
          {reservation.status === 'pending' && (
            <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
              Cancel Reservation
            </button>
          )}
          
          <Link 
            to={`/fleet/vehicles/${reservation.vehicleId}`}
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
