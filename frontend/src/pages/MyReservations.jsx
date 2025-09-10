import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { 
  FaSpinner, 
  FaCarSide, 
  FaCalendarAlt, 
  FaUser, 
  FaClock, 
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaCar
} from 'react-icons/fa';

const MyReservations = () => {
  const { user, getAuthHeaders } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchReservations();
    }
  }, [user]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        'http://localhost:5001/api/reservations/user',
        { headers: getAuthHeaders() }
      );
      setReservations(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Failed to load your reservations. Please try again later.');
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    try {
      const confirmation = window.confirm('Are you sure you want to cancel this reservation?');
      
      if (!confirmation) return;
      
      await axios.put(
        `http://localhost:5001/api/reservations/${reservationId}/cancel`,
        {},
        { headers: getAuthHeaders() }
      );
      
      toast.success('Reservation cancelled successfully');
      
      // Update reservation in local state
      setReservations(prevReservations => 
        prevReservations.map(res => 
          res._id === reservationId ? { ...res, status: 'cancelled' } : res
        )
      );
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel reservation');
    }
  };

  // Format price with commas
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    let color, icon, text;
    
    switch (status) {
      case 'confirmed':
        color = 'bg-green-100 text-green-800';
        icon = <FaCheckCircle className="mr-1" />;
        text = 'Confirmed';
        break;
      case 'cancelled':
        color = 'bg-red-100 text-red-800';
        icon = <FaTimesCircle className="mr-1" />;
        text = 'Cancelled';
        break;
      case 'completed':
        color = 'bg-blue-100 text-blue-800';
        icon = <FaCheckCircle className="mr-1" />;
        text = 'Completed';
        break;
      default: // pending
        color = 'bg-yellow-100 text-yellow-800';
        icon = <FaExclamationCircle className="mr-1" />;
        text = 'Pending';
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {icon} {text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Reservations</h1>
        
        {error ? (
          <div className="bg-red-100 p-4 rounded-md text-red-800">
            {error}
          </div>
        ) : reservations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FaCar className="mx-auto text-gray-400 text-5xl mb-4" />
            <h2 className="text-2xl font-medium text-gray-700 mb-2">No Reservations Yet</h2>
            <p className="text-gray-600 mb-6">You haven't made any vehicle reservations yet.</p>
            <Link 
              to="/fleet" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Browse Vehicles
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {reservations.map(reservation => (
              <div key={reservation._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Reservation Header */}
                <div className="px-6 py-4 bg-blue-50 border-b border-blue-100 flex flex-wrap justify-between items-center">
                  <div className="flex items-center mb-2 md:mb-0">
                    <FaCalendarAlt className="text-blue-600 mr-2" />
                    <span className="text-gray-700 font-medium mr-4">
                      {new Date(reservation.pickupDate).toLocaleDateString()} - {new Date(reservation.returnDate).toLocaleDateString()}
                    </span>
                    <StatusBadge status={reservation.status} />
                  </div>
                  <div className="text-gray-500 text-sm">
                    Booking ID: {reservation._id.substring(reservation._id.length - 8)}
                  </div>
                </div>
                
                {/* Reservation Details */}
                <div className="p-6">
                  <div className="md:flex md:justify-between">
                    {/* Vehicle Info */}
                    <div className="mb-4 md:mb-0 md:mr-6">
                      <div className="flex items-start">
                        {reservation.vehicleId?.imageUrl ? (
                          <img 
                            src={reservation.vehicleId.imageUrl} 
                            alt={`${reservation.vehicleId.make} ${reservation.vehicleId.model}`} 
                            className="w-24 h-20 object-cover rounded-md mr-4"
                          />
                        ) : (
                          <div className="w-24 h-20 bg-gray-200 rounded-md flex items-center justify-center mr-4">
                            <FaCarSide className="text-gray-400 text-2xl" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {reservation.vehicleId ? `${reservation.vehicleId.make} ${reservation.vehicleId.model}` : 'Vehicle Not Available'}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {reservation.vehicleId?.year} - {reservation.vehicleId?.fuelType} - {reservation.vehicleId?.transmission}
                          </p>
                          <div className="mt-2 flex items-center text-sm">
                            <FaClock className="text-gray-500 mr-1" />
                            <span className="text-gray-600">
                              {Math.ceil((new Date(reservation.returnDate) - new Date(reservation.pickupDate)) / (1000 * 60 * 60 * 24))} days
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Price Info */}
                    <div className="md:text-right">
                      <div className="text-lg font-bold text-blue-600">
                        Rs. {formatPrice(reservation.totalPrice)}
                      </div>
                      <div className="text-gray-600 text-sm">
                        {reservation.driverRequired && (
                          <div className="flex items-center justify-end mt-1">
                            <FaUser className="text-gray-500 mr-1" />
                            <span>
                              Driver: Rs. {formatPrice(reservation.driverPrice)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-end mt-1">
                          <FaMoneyBillWave className="text-gray-500 mr-1" />
                          <span>
                            Base: Rs. {formatPrice(reservation.basePrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Driver Info (if applicable) */}
                  {reservation.driverRequired && reservation.driverId && (
                    <div className="mt-6 bg-gray-50 p-4 rounded-md">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Driver Information</h4>
                      <div className="flex items-center">
                        {reservation.driverId.imageUrl ? (
                          <img 
                            src={reservation.driverId.imageUrl} 
                            alt={reservation.driverId.name} 
                            className="w-12 h-12 rounded-full mr-4 object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                            <FaUser className="text-gray-500" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{reservation.driverId.name}</div>
                          <div className="text-sm text-gray-600">{reservation.driverId.contactNumber}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Notes */}
                  {reservation.notes && (
                    <div className="mt-4 text-sm text-gray-600">
                      <h4 className="font-medium text-gray-700">Notes:</h4>
                      <p className="mt-1">{reservation.notes}</p>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="mt-6 flex justify-end">
                    {reservation.status === 'pending' && (
                      <button
                        onClick={() => handleCancelReservation(reservation._id)}
                        className="ml-3 px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                      >
                        Cancel Reservation
                      </button>
                    )}
                    <Link
                      to={`/fleet/vehicles/${reservation.vehicleId?._id}`}
                      className="ml-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      View Vehicle
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReservations;
