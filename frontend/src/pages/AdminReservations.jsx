import React, { useState, useEffect } from 'react';
import { apiGet, apiPut } from '../utils/apiUtils';
import { useAuth } from '../hooks/useAuth';
import { AdminNavbar } from '../components/AdminNavbar';
import { motion } from 'framer-motion';
import {
  FaCalendarAlt,
  FaCarAlt,
  FaUserAlt,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800'
};

const AdminReservations = () => {
  const { user, getAuthHeaders } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [sortField, setSortField] = useState('createdAt');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [statusChangeInfo, setStatusChangeInfo] = useState({
    reservationId: null,
    newStatus: null,
    message: ''
  });

  // Fetch reservations on component mount
  // Function to fetch reservations data
  const fetchReservations = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/reservations');
      setReservations(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load reservations. Please try again.');
      setLoading(false);
    }
  };
  
  // Load reservations on component mount
  useEffect(() => {
    fetchReservations();
  }, []);

  const openStatusChangeConfirmation = (reservationId, newStatus) => {
    const reservation = reservations.find(r => r._id === reservationId);
    if (!reservation) return;

    let message = '';
    
    if (newStatus === 'confirmed' && reservation.status !== 'confirmed') {
      message = `Confirming this reservation will mark the vehicle ${reservation.vehicleId?.make} ${reservation.vehicleId?.model} as 'rented'${
        reservation.driverRequired && reservation.driverId ? ` and the driver ${reservation.driverId?.name || ''} as 'on duty'` : ''
      }. Are you sure?`;
    } 
    else if ((newStatus === 'cancelled' || newStatus === 'completed') && reservation.status === 'confirmed') {
      message = `${newStatus === 'cancelled' ? 'Cancelling' : 'Completing'} this reservation will mark the vehicle ${reservation.vehicleId?.make} ${reservation.vehicleId?.model} as 'available'${
        reservation.driverRequired && reservation.driverId ? ` and the driver ${reservation.driverId?.name || ''} as 'available'` : ''
      }. Are you sure?`;
    }
    else {
      message = `Are you sure you want to change the status to ${newStatus}?`;
    }

    setStatusChangeInfo({
      reservationId,
      newStatus,
      message
    });
    setShowConfirmModal(true);
  };

  const handleStatusChange = async () => {
    const { reservationId, newStatus } = statusChangeInfo;
    
    try {
      setShowConfirmModal(false);
      await apiPut(`/reservations/${reservationId}/status`, { status: newStatus });
      
      // Refresh the reservations list to get updated vehicle and driver status
      await fetchReservations();
      
      toast.success(`Reservation status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update reservation status');
    }
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Filtering and sorting logic
  const filteredReservations = reservations
    .filter(reservation => {
      // Filter by search term
      const searchString = [
        reservation.userId?.name || '',
        reservation.userId?.email || '',
        reservation._id || '',
        reservation.vehicleId?.make || '',
        reservation.vehicleId?.model || '',
        reservation.vehicleId?.year || '',
        reservation.status || '',
        reservation.paymentStatus || '',
        reservation.driverRequired ? 'driver' : 'self drive'
      ].join(' ').toLowerCase();
      
      const matchesSearch = searchTerm === '' || searchString.includes(searchTerm.toLowerCase());
      
      // Filter by status
      const matchesStatus = filterStatus === 'all' || reservation.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sort by selected field
      let aValue, bValue;
      
      // Handle specific fields
      if (sortField === 'customerName') {
        aValue = a.userId?.name || '';
        bValue = b.userId?.name || '';
      } else if (sortField === 'vehicleName') {
        aValue = `${a.vehicleId?.make || ''} ${a.vehicleId?.model || ''}`;
        bValue = `${b.vehicleId?.make || ''} ${b.vehicleId?.model || ''}`;
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
      }
      
      // Handle date fields
      if (sortField === 'createdAt' || sortField === 'pickupDate' || sortField === 'returnDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      // Sort direction
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Toggle sort order
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reservations Management</h1>
          <p className="text-gray-600">View and manage all vehicle reservations</p>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap gap-4 items-center">
          {/* Search Input */}
          <div className="flex-grow max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, vehicle..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          {/* Status Filter */}
          <div className="relative">
            <select
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          {/* Sort Controls */}
          <div className="flex items-center">
            <button
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
              onClick={() => handleSort('createdAt')}
            >
              {sortOrder === 'asc' ? <FaSortAmountUp className="mr-2" /> : <FaSortAmountDown className="mr-2" />}
              {sortField === 'createdAt' ? <strong>Date</strong> : 'Date'}
            </button>
          </div>
          
          {/* Refresh Button */}
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ml-auto"
            onClick={fetchReservations}
          >
            Refresh
          </button>
        </div>
        
        {/* Reservations List */}
        {loading ? (
          <div className="bg-white p-8 rounded-lg shadow-md flex justify-center">
            <div className="animate-pulse text-center">
              <div className="h-8 bg-gray-200 rounded w-64 mb-4 mx-auto"></div>
              <div className="h-6 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-center">
            <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
            <p className="text-red-700">{error}</p>
            <button
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              onClick={fetchReservations}
            >
              Try Again
            </button>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <FaCalendarAlt className="text-5xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Reservations Found</h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all' 
                ? 'No reservations match your search criteria'
                : 'There are no reservations in the system yet'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredReservations.map(reservation => (
              <motion.div
                key={reservation._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Reservation Summary */}
                  <div className="p-6 flex-grow">
                    <div className="flex flex-wrap items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 mr-2">
                        Reservation #{reservation._id.substring(0, 8)}...
                      </h3>
                      <div className={`px-3 py-1 rounded-full ${statusColors[reservation.status]} text-sm font-medium`}>
                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Vehicle Info */}
                      <div className="flex items-center">
                        <FaCarAlt className="text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium">Vehicle</p>
                          <p className="text-gray-700">
                            {reservation.vehicleId?.make} {reservation.vehicleId?.model} ({reservation.vehicleId?.year})
                          </p>
                          <p className={`text-sm ${
                            reservation.vehicleId?.status === 'available' ? 'text-green-600' : 
                            reservation.vehicleId?.status === 'rented' ? 'text-orange-600' : 
                            reservation.vehicleId?.status === 'maintenance' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            Status: {reservation.vehicleId?.status?.charAt(0).toUpperCase() + reservation.vehicleId?.status?.slice(1) || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Customer Info */}
                      <div className="flex items-center">
                        <FaUserAlt className="text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium">Customer</p>
                          <p className="text-gray-700">{reservation.userId?.name || 'N/A'}</p>
                          <p className="text-gray-500 text-sm">{reservation.userId?.email || 'N/A'}</p>
                        </div>
                      </div>
                      
                      {/* Dates */}
                      <div className="flex items-center">
                        <FaCalendarAlt className="text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium">Pickup / Return</p>
                          <p className="text-gray-700">
                            {formatDate(reservation.pickupDate)} - {formatDate(reservation.returnDate)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Locations */}
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium">Locations</p>
                          <p className="text-gray-700">
                            Pickup: {reservation.pickupLocation || 'Not specified'}
                          </p>
                          <p className="text-gray-700">
                            Return: {reservation.returnLocation || 'Not specified'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Driver & Payment Status */}
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium">Driver & Payment</p>
                          <p className="text-gray-700">
                            {reservation.driverRequired ? 'Driver Required' : 'Self Drive'} | 
                            <span className={reservation.paymentStatus === 'paid' ? 'text-green-600 ml-1' : 'text-yellow-600 ml-1'}>
                              {reservation.paymentStatus.charAt(0).toUpperCase() + reservation.paymentStatus.slice(1)}
                            </span>
                          </p>
                          {reservation.driverRequired && reservation.driverId && (
                            <div className="mt-1">
                              <p className="text-sm text-gray-700">
                                Driver: {reservation.driverId.name || 'Not assigned'}
                              </p>
                              <p className={`text-xs ${
                                reservation.driverId.status === 'available' ? 'text-green-600' : 
                                reservation.driverId.status === 'on_duty' ? 'text-orange-600' : 
                                'text-gray-600'
                              }`}>
                                Status: {reservation.driverId.status?.replace('_', ' ')?.charAt(0).toUpperCase() + 
                                  reservation.driverId.status?.replace('_', ' ')?.slice(1) || 'Unknown'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 flex flex-wrap justify-between items-center">
                      <div>
                        <p className="text-gray-500 text-sm">
                          <FaClock className="inline mr-1" /> Created: {formatDate(reservation.createdAt)}
                        </p>
                        <p className="font-semibold text-blue-600">
                          Rs {reservation.totalPrice?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 mt-3 md:mt-0">
                        {reservation.status === 'pending' && (
                          <>
                            <button
                              onClick={() => openStatusChangeConfirmation(reservation._id, 'confirmed')}
                              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                            >
                              <FaCheckCircle className="mr-1" /> Confirm
                            </button>
                            <button
                              onClick={() => openStatusChangeConfirmation(reservation._id, 'cancelled')}
                              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                            >
                              <FaTimesCircle className="mr-1" /> Cancel
                            </button>
                          </>
                        )}
                        
                        {reservation.status === 'confirmed' && (
                          <>
                            <button
                              onClick={() => openStatusChangeConfirmation(reservation._id, 'completed')}
                              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                            >
                              <FaCheckCircle className="mr-1" /> Mark Completed
                            </button>
                            <button
                              onClick={() => openStatusChangeConfirmation(reservation._id, 'cancelled')}
                              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                            >
                              <FaTimesCircle className="mr-1" /> Cancel
                            </button>
                          </>
                        )}
                        
                        {/* View Details button for all statuses */}
                        <button
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Confirm Status Change</h3>
            <p className="text-gray-700 mb-6">{statusChangeInfo.message}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusChange}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReservations;
