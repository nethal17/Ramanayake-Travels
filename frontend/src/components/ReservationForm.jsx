import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUserAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ReservationForm = ({ vehicle }) => {
  const { user, isAuthenticated, getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    pickupDate: '',
    returnDate: '',
    pickupLocation: '',
    returnLocation: '',
    driverRequired: false,
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
  };

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
      totalPrice += 2500 * diffDays; // Driver fee per day
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
    
    // Validate dates
    const pickup = new Date(formData.pickupDate);
    const returnDate = new Date(formData.returnDate);
    const today = new Date();
    
    if (pickup < today) {
      toast.error('Pickup date cannot be in the past');
      return;
    }
    
    if (returnDate < pickup) {
      toast.error('Return date must be after pickup date');
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
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
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
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
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
            <span>I need a driver (additional Rs 2,500/day)</span>
          </label>
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
              placeholder="Your phone number"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
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
                <span className="font-medium">Rs 2,500 × {calculateTotalPrice() / vehicle.price} days</span>
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
