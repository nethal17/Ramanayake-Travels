import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaCarAlt, 
  FaCheckCircle, 
  FaArrowLeft,
  FaUserAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaMoneyBillWave,
  FaTimesCircle,
  FaExclamationCircle,
  FaFlagCheckered
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
    // Optional: add specific data validation checks here if needed
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
      // The notes string is in format: "Customer Name: John Doe, Phone: 1234567890, Email: john@example.com"
      if (field === 'name') {
        const nameMatch = notes.match(/Customer Name: (.*?)(?:,|$)/);
        return nameMatch && nameMatch[1] ? nameMatch[1].trim() : 'Not available';
      } else if (field === 'phone') {
        const phoneMatch = notes.match(/Phone: (.*?)(?:,|$)/);
        return phoneMatch && phoneMatch[1] ? phoneMatch[1].trim() : 'Not available';
      } else if (field === 'email') {
        const emailMatch = notes.match(/Email: (.*?)(?:,|$)/);
        return emailMatch && emailMatch[1] ? emailMatch[1].trim() : 'Not available';
      }
      
      return 'Not available';
    } catch (e) {
      console.error('Error extracting customer info:', e);
      return 'Not available';
    }
  };
  
  // Get customer info from userId if available, otherwise from notes
  const getCustomerInfo = (field) => {
    // First check if we have userId object with the needed info
    if (reservation && reservation.userId) {
      if (field === 'name' && reservation.userId.name) {
        return reservation.userId.name;
      } else if (field === 'email' && reservation.userId.email) {
        return reservation.userId.email;
      } else if (field === 'phone') {
        // Phone might not be in userId object, fallback to notes
        return extractCustomerInfo(reservation.notes, field);
      }
    }
    
    // Fall back to notes
    return extractCustomerInfo(reservation.notes, field);
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    try {
      if (reservation && reservation.totalPrice) {
        return `Rs ${reservation.totalPrice.toLocaleString()}`;
      } else if (vehicle && vehicle.price) {
        const driverCost = reservation && reservation.driverRequired ? (reservation.driverPrice || 2500) : 0;
        const basePrice = reservation.basePrice || vehicle.price;
        return `Rs ${(basePrice + driverCost).toLocaleString()}`;
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
    if (!reservation) return 'bg-gray-100 text-gray-800';
    
    switch (reservation.status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status message
  const getStatusMessage = () => {
    if (!reservation) return 'Your reservation is being processed.';
    
    switch (reservation.status) {
      case 'confirmed':
        return 'Your reservation is confirmed.';
      case 'pending':
        return 'Your reservation is pending confirmation.';
      case 'cancelled':
        return 'Your reservation has been cancelled.';
      case 'completed':
        return 'Your reservation has been completed.';
      default:
        return 'Your reservation is being processed.';
    }
  };

  // Get status box class
  const getStatusBoxClass = () => {
    if (!reservation) return 'bg-blue-50 border-blue-200';
    
    switch (reservation.status) {
      case 'confirmed':
        return 'bg-green-50 border-green-200';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'cancelled':
        return 'bg-red-50 border-red-200';
      case 'completed':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  // Get status icon box class
  const getStatusIconBoxClass = () => {
    if (!reservation) return 'bg-blue-100';
    
    switch (reservation.status) {
      case 'confirmed':
        return 'bg-green-100';
      case 'pending':
        return 'bg-yellow-100';
      case 'cancelled':
        return 'bg-red-100';
      case 'completed':
        return 'bg-blue-100';
      default:
        return 'bg-blue-100';
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    if (!reservation) return <FaCheckCircle className="text-blue-600 text-2xl" />;
    
    switch (reservation.status) {
      case 'confirmed':
        return <FaCheckCircle className="text-green-600 text-2xl" />;
      case 'pending':
        return <FaExclamationCircle className="text-yellow-600 text-2xl" />;
      case 'cancelled':
        return <FaTimesCircle className="text-red-600 text-2xl" />;
      case 'completed':
        return <FaCheckCircle className="text-blue-600 text-2xl" />;
      default:
        return <FaCheckCircle className="text-blue-600 text-2xl" />;
    }
  };

  // Get status text class
  const getStatusTextClass = () => {
    if (!reservation) return 'text-blue-700';
    
    switch (reservation.status) {
      case 'confirmed':
        return 'text-green-700';
      case 'pending':
        return 'text-yellow-700';
      case 'cancelled':
        return 'text-red-700';
      case 'completed':
        return 'text-blue-700';
      default:
        return 'text-blue-700';
    }
  };

  // Get status title
  const getStatusTitle = () => {
    if (!reservation) return 'Reservation Submitted!';
    
    switch (reservation.status) {
      case 'confirmed':
        return 'Reservation Confirmed!';
      case 'pending':
        return 'Reservation Pending';
      case 'cancelled':
        return 'Reservation Cancelled';
      case 'completed':
        return 'Reservation Completed';
      default:
        return 'Reservation Submitted!';
    }
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
          {/* Status Message Box */}
          <div className={`${getStatusBoxClass()} border rounded-lg p-6 mb-8 flex items-center`}>
            <div className={`${getStatusIconBoxClass()} p-3 rounded-full mr-4`}>
              {getStatusIcon()}
            </div>
            <div>
              <h2 className={`text-xl font-bold ${getStatusTextClass()}`}>
                {getStatusTitle()}
              </h2>
              <p className={getStatusTextClass()}>{getStatusMessage()}</p>
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
                          {reservation.driverRequired && reservation.driverId && (
                            <p className="text-sm text-gray-600 mt-1">
                              Driver ID: {typeof reservation.driverId === 'object' ? 
                                reservation.driverId._id : reservation.driverId}
                            </p>
                          )}
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
                          <p className="text-gray-700">{getCustomerInfo('name')}</p>
                        </div>
                      </li>
                      <li className="flex items-center">
                        <FaPhoneAlt className="text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium">Phone Number</p>
                          <p className="text-gray-700">{getCustomerInfo('phone')}</p>
                        </div>
                      </li>
                      <li className="flex items-center">
                        <FaEnvelope className="text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-gray-700">{getCustomerInfo('email')}</p>
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
                      to="/my-reservations"
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
