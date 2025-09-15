import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUserAlt, FaPhoneAlt, FaEnvelope, FaUserTie, FaExclamationCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { apiGet } from '../utils/apiUtils';

const ReservationForm = ({ vehicle }) => {
  const { user, isAuthenticated, getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [errors, setErrors] = useState({
    pickupDate: '',
    returnDate: '',
    phone: ''
  });
  const [formData, setFormData] = useState({
    pickupDate: '',
    returnDate: '',
    pickupLocation: '',
    returnLocation: '',
    driverRequired: false,
    driverId: '',
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Validate dates
    if (name === 'pickupDate' || name === 'returnDate') {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to beginning of day for fair comparison
      
      if (selectedDate < today) {
        setErrors(prev => ({ ...prev, [name]: 'Date cannot be in the past' }));
      } else {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
      
      // Additional validation for return date
      if (name === 'returnDate' && formData.pickupDate) {
        const pickupDate = new Date(formData.pickupDate);
        if (selectedDate < pickupDate) {
          setErrors(prev => ({ ...prev, returnDate: 'Return date must be after pickup date' }));
        }
      }
      
      // If pickup date changes, validate return date as well
      if (name === 'pickupDate' && formData.returnDate) {
        const returnDate = new Date(formData.returnDate);
        if (returnDate < selectedDate) {
          setErrors(prev => ({ ...prev, returnDate: 'Return date must be after pickup date' }));
        } else {
          setErrors(prev => ({ ...prev, returnDate: '' }));
        }
      }
    }
    
    // Validate phone number
    if (name === 'phone') {
      // Check if starts with +94 followed by 9 digits or 0 followed by 9 digits
      const phoneRegex = /^(\+94\d{9}|0\d{9})$/;
      if (!phoneRegex.test(value)) {
        setErrors(prev => ({ 
          ...prev, 
          phone: 'Phone must be 10 digits starting with +94 or 0' 
        }));
      } else {
        setErrors(prev => ({ ...prev, phone: '' }));
      }
    }
    
    // If pickup date or return date changed and both are set, fetch available drivers
    if ((name === 'pickupDate' || name === 'returnDate') && 
        formData.pickupDate && formData.returnDate) {
      fetchAvailableDrivers();
    }
    
    // If driver is no longer required, clear the driver selection
    if (name === 'driverRequired' && !checked) {
      setFormData(prev => ({...prev, driverId: ''}));
    }
  };
  
  // Function to fetch available drivers based on the selected dates
  const fetchAvailableDrivers = async () => {
    if (!formData.pickupDate || !formData.returnDate) return;
    
    try {
      setLoadingDrivers(true);
      // Query the backend API for available drivers
      const response = await apiGet('/reservations/drivers', {
        pickupDate: formData.pickupDate,
        returnDate: formData.returnDate
      });
      
      setAvailableDrivers(response);
    } catch (error) {
      console.error('Error fetching available drivers:', error);
      toast.error('Failed to fetch available drivers');
    } finally {
      setLoadingDrivers(false);
    }
  };
  
  // When dates change, fetch available drivers
  useEffect(() => {
    if (formData.pickupDate && formData.returnDate && formData.driverRequired) {
      fetchAvailableDrivers();
    }
  }, [formData.pickupDate, formData.returnDate]);

  const calculateTotalPrice = () => {
    if (!formData.pickupDate || !formData.returnDate) return 0;
    
    const pickup = new Date(formData.pickupDate);
    const returnDate = new Date(formData.returnDate);
    
    // Calculate difference in days
    const diffTime = Math.abs(returnDate - pickup);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Base price from vehicle
    let totalPrice = vehicle.price * diffDays;
    
    // Add driver fee if needed
    if (formData.driverRequired) {
      // If a specific driver is selected, use their rate, otherwise use default rate
      const selectedDriver = formData.driverId && availableDrivers.find(d => d._id === formData.driverId);
      const driverRate = selectedDriver ? selectedDriver.dailyRate : 2500; // Default rate if no specific driver selected
      
      totalPrice += driverRate * diffDays;
    }
    
    return totalPrice;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!isAuthenticated) {
      toast.error('Please log in to make a reservation');
      return;
    }
    
    // Check for validation errors
    if (errors.pickupDate || errors.returnDate || errors.phone) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }
    
    // Validate dates
    const pickup = new Date(formData.pickupDate);
    const returnDate = new Date(formData.returnDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to beginning of day
    
    if (pickup < today) {
      setErrors(prev => ({ ...prev, pickupDate: 'Pickup date cannot be in the past' }));
      toast.error('Pickup date cannot be in the past');
      return;
    }
    
    if (returnDate < pickup) {
      setErrors(prev => ({ ...prev, returnDate: 'Return date must be after pickup date' }));
      toast.error('Return date must be after pickup date');
      return;
    }
    
    // Validate phone format
    const phoneRegex = /^(\+94\d{9}|0\d{9})$/;
    if (!phoneRegex.test(formData.phone)) {
      setErrors(prev => ({ ...prev, phone: 'Phone must be 10 digits starting with +94 or 0' }));
      toast.error('Please enter a valid phone number');
      return;
    }
    
    // Validate driver selection if driver is required
    if (formData.driverRequired && !formData.driverId) {
      toast.error('Please select a driver');
      return;
    }
    
    try {
      setLoading(true);
      const reservationData = {
        vehicleId: vehicle._id,
        pickupDate: formData.pickupDate,
        returnDate: formData.returnDate,
        pickupLocation: formData.pickupLocation,
        returnLocation: formData.returnLocation,
        driverRequired: formData.driverRequired,
        driverId: formData.driverRequired ? formData.driverId : null,
        notes: `Customer Name: ${formData.fullName}, Phone: ${formData.phone}, Email: ${formData.email}`
      };
      
      const response = await axios.post('http://localhost:5001/api/reservations', reservationData, {
        headers: getAuthHeaders()
      });
      
      toast.success('Reservation submitted successfully!');
      navigate('/reservation-confirmation', { 
        state: { 
          reservation: response.data,
          vehicle: vehicle 
        }
      });
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error(error.response?.data?.message || 'Failed to create reservation');
    } finally {
      setLoading(false);
    }
  };

  const isDateValid = () => {
    if (!formData.pickupDate || !formData.returnDate) return false;
    
    const pickup = new Date(formData.pickupDate);
    const returnDate = new Date(formData.returnDate);
    const today = new Date();
    
    return pickup >= today && returnDate >= pickup;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Book This Vehicle</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              <FaCalendarAlt className="inline mr-2" />
              Pickup Date
            </label>
            <input
              type="date"
              name="pickupDate"
              value={formData.pickupDate}
              onChange={handleChange}
              className={`w-full p-3 border ${errors.pickupDate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
              min={new Date().toISOString().split('T')[0]} // Set min to today's date
            />
            {errors.pickupDate && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <FaExclamationCircle className="mr-1" /> {errors.pickupDate}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              <FaCalendarAlt className="inline mr-2" />
              Return Date
            </label>
            <input
              type="date"
              name="returnDate"
              value={formData.returnDate}
              onChange={handleChange}
              className={`w-full p-3 border ${errors.returnDate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
              min={formData.pickupDate || new Date().toISOString().split('T')[0]} // Set min to pickup date or today
            />
            {errors.returnDate && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <FaExclamationCircle className="mr-1" /> {errors.returnDate}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              <FaMapMarkerAlt className="inline mr-2" />
              Pickup Location
            </label>
            <input
              type="text"
              name="pickupLocation"
              value={formData.pickupLocation}
              onChange={handleChange}
              placeholder="Enter pickup location"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              <FaMapMarkerAlt className="inline mr-2" />
              Return Location
            </label>
            <input
              type="text"
              name="returnLocation"
              value={formData.returnLocation}
              onChange={handleChange}
              placeholder="Enter return location"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="flex items-center text-gray-700 font-medium cursor-pointer">
            <input
              type="checkbox"
              name="driverRequired"
              checked={formData.driverRequired}
              onChange={handleChange}
              className="mr-2 h-5 w-5 text-blue-600"
            />
            <span>I need a driver</span>
          </label>
          
          {formData.driverRequired && (
            <div className="mt-4 ml-7">
              <label className="block text-gray-700 font-medium mb-2">
                <FaUserTie className="inline mr-2" />
                Select Driver
              </label>
              {loadingDrivers ? (
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-6 py-1">
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ) : availableDrivers.length > 0 ? (
                <select
                  name="driverId"
                  value={formData.driverId}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={formData.driverRequired}
                >
                  <option value="">Select a driver</option>
                  {availableDrivers.map(driver => (
                    <option key={driver._id} value={driver._id}>
                      {driver.userId?.name} - Rs {driver.dailyRate}/day - {driver.yearsOfExperience} years exp.
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-red-500">
                  No drivers available for the selected dates. Please choose different dates or continue without a driver.
                </p>
              )}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              <FaUserAlt className="inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Your full name"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              <FaPhoneAlt className="inline mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Your phone number (e.g., 0771234567 or +94771234567)"
              className={`w-full p-3 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <FaExclamationCircle className="mr-1" /> {errors.phone}
              </p>
            )}
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-medium mb-2">
              <FaEnvelope className="inline mr-2" />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your email address"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        
        {isDateValid() && (
          <div className="mb-6 p-4 bg-blue-50 rounded-md">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">Reservation Summary</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Vehicle Rental:</span>
              <span className="font-medium">Rs {vehicle.price.toLocaleString()} × {calculateTotalPrice() / vehicle.price} days</span>
            </div>
            {formData.driverRequired && (
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-700">Driver Fee:</span>
                {formData.driverId && availableDrivers.find(d => d._id === formData.driverId) ? (
                  <span className="font-medium">
                    Rs {availableDrivers.find(d => d._id === formData.driverId).dailyRate.toLocaleString()} × {calculateTotalPrice() / vehicle.price} days
                  </span>
                ) : (
                  <span className="font-medium">Rs 2,500 × {calculateTotalPrice() / vehicle.price} days</span>
                )}
              </div>
            )}
            <div className="flex justify-between items-center mt-2 text-lg font-bold">
              <span>Total:</span>
              <span>Rs {calculateTotalPrice().toLocaleString()}</span>
            </div>
          </div>
        )}
        
        <button
          type="submit"
          className={`w-full py-3 px-4 font-medium rounded-md ${
            vehicle.status === 'available'
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 cursor-not-allowed text-gray-500'
          } transition-colors`}
          disabled={vehicle.status !== 'available' || loading}
        >
          {loading ? 'Processing...' : 'Book Now'}
        </button>
        
        {vehicle.status !== 'available' && (
          <p className="mt-2 text-red-500 text-center">
            This vehicle is currently not available for booking
          </p>
        )}
      </form>
    </motion.div>
  );
};

export default ReservationForm;
