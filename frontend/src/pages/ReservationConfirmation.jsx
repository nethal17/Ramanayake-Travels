import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaCarAlt, 
  FaCheckCircle, 
  FaArrowLeft,
  FaUserAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaMoneyBillWave
} from 'react-icons/fa';

const ReservationConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { reservation, vehicle } = location.state || {};
  
  // Loading state
  const [loading, setLoading] = useState(true);

  // If no reservation data, redirect back to home
  useEffect(() => {
    if (!location.state) {
      toast.error('No reservation data found');
      navigate('/');
      return;
    }
    
    // If we have data, set loading to false
    if (reservation && vehicle) {
      setLoading(false);
    } else {
      // Set a timeout to prevent endless loading if data is missing
      const timer = setTimeout(() => {
        if (!reservation || !vehicle) {
          toast.error('Unable to load reservation details');
          navigate('/');
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [reservation, vehicle, location.state, navigate]);

  // Debug reservation and vehicle data
  useEffect(() => {
    // Data checking happens here
  }, [reservation, vehicle]);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    
    try {
      // Try different parsing approaches
      let date;
      
      // If it's a timestamp number
      if (!isNaN(Number(dateString))) {
        date = new Date(Number(dateString));
      } 
      // If it's an ISO string or other supported format
      else {
        date = new Date(dateString);
      }
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date format';
      }
      
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    } catch (e) {
      return 'Invalid date format';
    }
  };

  // Extract customer info from notes field
  const extractCustomerInfo = (notes, field) => {
    if (!notes) return 'Not available';
    
    try {
      const notesParts = notes.split(',');
      let fieldInfo;
      
      if (field === 'name') {
        fieldInfo = notesParts[0];
        return fieldInfo && fieldInfo.includes('Customer Name:') 
          ? fieldInfo.replace('Customer Name:', '').trim() 
          : 'Not available';
      } else if (field === 'phone') {
        fieldInfo = notesParts.find(part => part.includes('Phone:'));
        return fieldInfo 
          ? fieldInfo.replace('Phone:', '').trim() 
          : 'Not available';
      } else if (field === 'email') {
        fieldInfo = notesParts.find(part => part.includes('Email:'));
        return fieldInfo 
          ? fieldInfo.replace('Email:', '').trim() 
          : 'Not available';
      }
      
      return 'Not available';
    } catch (e) {
      return 'Not available';
    }
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    try {
      if (reservation && reservation.totalPrice) {
        return `Rs ${reservation.totalPrice.toLocaleString()}`;
      } else if (vehicle && vehicle.price) {
        const driverCost = reservation && reservation.driverRequired ? 2500 : 0;
        return `Rs ${(vehicle.price + driverCost).toLocaleString()}`;
      }
      return 'N/A';
    } catch (e) {
      return 'N/A';
    }
  };

  // Format the reservation status
  const formatStatus = () => {
    try {
      if (reservation && reservation.status) {
        return reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1);
      }
      return 'Pending';
    } catch (e) {
      return 'Pending';
    }
  };

  // Get status color classes
  const getStatusClasses = () => {
    if (reservation && reservation.status === 'confirmed') {
      return 'bg-green-100 text-green-800';
    } else if (reservation && reservation.status === 'pending') {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  // Get status message
  const getStatusMessage = () => {
    if (reservation && reservation.status === 'confirmed') {
      return 'Your reservation is confirmed.';
    } else if (reservation && reservation.status === 'pending') {
      return 'Your reservation is pending confirmation.';
    }
    return 'Your reservation is being processed.';
  };

  return (
    <div className="container mx-auto px-4 py-10">
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-700 text-xl">Loading reservation details...</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <FaCheckCircle className="text-green-600 text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-800">Reservation Submitted!</h2>
              <p className="text-green-700">Your reservation has been successfully submitted and is awaiting confirmation.</p>
            </div>
          </div>
          
          {/* Reservation Details Card */}
          {reservation && vehicle && (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-blue-600 text-white p-6">
                <h1 className="text-2xl font-bold">Reservation Summary</h1>
                <p>Reservation ID: {reservation._id}</p>
              </div>
              
              <div className="p-6">
                {/* Vehicle Information */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Vehicle Information</h2>
                  <div className="flex items-start gap-4">
                    {vehicle && vehicle.imageUrl && (
                      <img 
                        src={vehicle.imageUrl} 
                        alt={`${vehicle.make} ${vehicle.model}`} 
                        className="w-32 h-24 object-cover rounded-md" 
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold">
                        {vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.year})` : 'Vehicle Information Not Available'}
                      </h3>
                    </div>
                  </div>
                </div>
                
                {/* Reservation Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Reservation Details</h2>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <FaCalendarAlt className="text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium">Pickup Date</p>
                          <p className="text-gray-700">{formatDate(reservation.pickupDate)}</p>
                        </div>
                      </li>
                      <li className="flex items-center">
                        <FaCalendarAlt className="text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium">Return Date</p>
                          <p className="text-gray-700">{formatDate(reservation.returnDate)}</p>
                        </div>
                      </li>
                      <li className="flex items-center">
                        <FaMapMarkerAlt className="text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium">Pickup Location</p>
                          <p className="text-gray-700">{reservation.pickupLocation || 'Not specified'}</p>
                        </div>
                      </li>
                      <li className="flex items-center">
                        <FaMapMarkerAlt className="text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium">Return Location</p>
                          <p className="text-gray-700">{reservation.returnLocation || 'Not specified'}</p>
                        </div>
                      </li>
                      <li className="flex items-center">
                        <FaCarAlt className="text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium">Driver Requested</p>
                          <p className="text-gray-700">{reservation.driverRequired ? 'Yes' : 'No'}</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Customer Information</h2>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <FaUserAlt className="text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium">Full Name</p>
                          <p className="text-gray-700">{extractCustomerInfo(reservation.notes, 'name')}</p>
                        </div>
                      </li>
                      <li className="flex items-center">
                        <FaPhoneAlt className="text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium">Phone Number</p>
                          <p className="text-gray-700">{extractCustomerInfo(reservation.notes, 'phone')}</p>
                        </div>
                      </li>
                      <li className="flex items-center">
                        <FaEnvelope className="text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-gray-700">{extractCustomerInfo(reservation.notes, 'email')}</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
                
                {/* Payment Information */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Payment Information</h2>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-medium">Total Amount:</span>
                      <span className="font-bold text-blue-600">{calculateTotalPrice()}</span>
                    </div>
                    <p className="text-gray-600 mt-2 text-sm">
                      Payment will be collected at pickup. We accept cash, credit cards, and online payment options.
                    </p>
                  </div>
                </div>
                
                {/* Reservation Status */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Status</h2>
                  <div className="flex items-center">
                    <div className={`px-3 py-1 rounded-full ${getStatusClasses()} font-medium`}>
                      {formatStatus()}
                    </div>
                    <p className="ml-3 text-gray-600">{getStatusMessage()}</p>
                  </div>
                </div>
                
                {/* Next Steps and Buttons */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Next Steps</h2>
                  <p className="mb-4 text-gray-700">
                    We will review your reservation and contact you shortly. A confirmation email has been sent to your email address.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link 
                      to="/"
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <FaArrowLeft className="mr-2" />
                      Return to Home
                    </Link>
                    
                    <Link
                      to="/profile"
                      className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 transition-colors"
                    >
                      View My Reservations
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ReservationConfirmation;
