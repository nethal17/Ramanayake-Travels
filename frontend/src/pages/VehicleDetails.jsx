import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { 
  FaCarSide, 
  FaGasPump, 
  FaCogs, 
  FaUsers, 
  FaDoorOpen, 
  FaCalendarAlt, 
  FaMoneyBillWave,
  FaSpinner,
  FaArrowLeft,
  FaCheck,
  FaTimes
} from 'react-icons/fa';

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getAuthHeaders } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [formData, setFormData] = useState({
    pickupDate: '',
    returnDate: '',
    driverRequired: false,
    driverId: '',
    notes: ''
  });
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [priceDetails, setPriceDetails] = useState({
    days: 0,
    basePrice: 0,
    driverPrice: 0,
    totalPrice: 0
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVehicleDetails();
  }, [id]);

  const fetchVehicleDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5001/api/vehicles/${id}`);
      setVehicle(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching vehicle details:', err);
      setError('Failed to load vehicle details. Please try again later.');
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      setLoadingDrivers(true);
      const response = await axios.get('http://localhost:5001/api/reservations/drivers');
      setDrivers(response.data);
      setLoadingDrivers(false);
    } catch (err) {
      console.error('Error fetching drivers:', err);
      toast.error('Failed to load driver information');
      setLoadingDrivers(false);
    }
  };

  const handleShowBookingForm = () => {
    if (!user) {
      toast.error('Please log in to book a vehicle');
      return;
    }
    setShowBookingForm(true);
    // Set default dates (today and tomorrow)
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setFormData({
      ...formData,
      pickupDate: today.toISOString().split('T')[0],
      returnDate: tomorrow.toISOString().split('T')[0]
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Reset availability check if dates change
    if (name === 'pickupDate' || name === 'returnDate') {
      setAvailabilityChecked(false);
    }
    
    // Fetch drivers if driver required is checked
    if (name === 'driverRequired' && newValue === true) {
      fetchDrivers();
    }
  };

  const calculatePrice = async () => {
    try {
      const { pickupDate, returnDate, driverRequired, driverId } = formData;
      
      // Check dates are valid
      if (new Date(pickupDate) >= new Date(returnDate)) {
        toast.error('Return date must be after pickup date');
        return false;
      }
      
      // Check vehicle availability
      const availabilityResponse = await axios.get(`http://localhost:5001/api/reservations/check-availability`, {
        params: {
          vehicleId: id,
          pickupDate,
          returnDate
        }
      });
      
      if (!availabilityResponse.data.available) {
        toast.error(availabilityResponse.data.message);
        return false;
      }
      
      // Calculate number of days and base price
      const { days, basePrice } = availabilityResponse.data;
      
      // Calculate driver price if driver is required
      let driverPrice = 0;
      if (driverRequired && driverId) {
        const selectedDriver = drivers.find(driver => driver._id === driverId);
        if (selectedDriver) {
          driverPrice = selectedDriver.dailyRate * days;
        }
      }
      
      // Calculate total price
      const totalPrice = basePrice + driverPrice;
      
      // Update price details
      setPriceDetails({
        days,
        basePrice,
        driverPrice,
        totalPrice
      });
      
      setAvailabilityChecked(true);
      return true;
    } catch (err) {
      console.error('Error calculating price:', err);
      toast.error('Failed to calculate price. Please try again.');
      return false;
    }
  };

  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    const available = await calculatePrice();
    if (available) {
      toast.success('Vehicle is available for the selected dates!');
      setBookingStep(2);
    }
  };

  const handleDriverSelection = async (e) => {
    e.preventDefault();
    
    // Recalculate price with driver if selected
    const priceUpdated = await calculatePrice();
    
    if (priceUpdated) {
      setBookingStep(3);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to complete your booking');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const bookingData = {
        vehicleId: id,
        pickupDate: formData.pickupDate,
        returnDate: formData.returnDate,
        driverRequired: formData.driverRequired,
        driverId: formData.driverRequired ? formData.driverId : null,
        notes: formData.notes
      };
      
      const response = await axios.post(
        'http://localhost:5001/api/reservations',
        bookingData,
        { headers: getAuthHeaders() }
      );
      
      toast.success('Booking successful!');
      navigate('/my-reservations');
    } catch (err) {
      console.error('Error submitting booking:', err);
      toast.error(err.response?.data?.message || 'Failed to submit booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetBookingForm = () => {
    setShowBookingForm(false);
    setBookingStep(1);
    setAvailabilityChecked(false);
    setFormData({
      pickupDate: '',
      returnDate: '',
      driverRequired: false,
      driverId: '',
      notes: ''
    });
    setPriceDetails({
      days: 0,
      basePrice: 0,
      driverPrice: 0,
      totalPrice: 0
    });
  };

  // Format price with commas
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl text-gray-800 mb-4">Vehicle Not Found</h2>
          <p className="text-gray-700">The vehicle you are looking for does not exist or has been removed.</p>
          <button 
            onClick={() => navigate('/fleet')} 
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Browse Vehicles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <FaArrowLeft className="mr-2" /> Back to Vehicles
        </button>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Vehicle Image */}
          <div className="relative h-64 md:h-96 bg-gradient-to-r from-blue-500 to-blue-700">
            {vehicle.imageUrl && (
              <img 
                src={vehicle.imageUrl} 
                alt={`${vehicle.make} ${vehicle.model}`} 
                className="w-full h-full object-cover"
              />
            )}
          </div>
          
          {/* Vehicle Details */}
          <div className="p-6 md:p-8">
            <div className="md:flex md:justify-between md:items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <FaCarSide className="mr-3 text-blue-600" />
                  {vehicle.make} {vehicle.model}
                </h1>
                <p className="text-gray-600 mt-2">{vehicle.year} - {vehicle.ownership} Owned</p>
              </div>
              
              <div className="mt-4 md:mt-0">
                <div className="text-3xl font-bold text-blue-600">
                  Rs. {formatPrice(vehicle.price)}<span className="text-sm font-normal">/day</span>
                </div>
                
                {!showBookingForm && (
                  <button 
                    onClick={handleShowBookingForm} 
                    className="mt-4 w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
                  >
                    Book Now
                  </button>
                )}
              </div>
            </div>
            
            {/* Specifications */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center">
                <FaGasPump className="text-blue-600 text-xl mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Fuel Type</p>
                  <p className="font-medium">{vehicle.fuelType}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FaCogs className="text-blue-600 text-xl mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Transmission</p>
                  <p className="font-medium">{vehicle.transmission}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FaUsers className="text-blue-600 text-xl mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Seats</p>
                  <p className="font-medium">{vehicle.seats}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FaDoorOpen className="text-blue-600 text-xl mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Doors</p>
                  <p className="font-medium">{vehicle.doors}</p>
                </div>
              </div>
            </div>
            
            {/* Features & Description */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
              <div className="flex flex-wrap gap-2 mb-6">
                {vehicle.extraOptions && vehicle.extraOptions.map((feature, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <FaCheck className="mr-1 text-xs" /> {feature}
                  </span>
                ))}
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">
                {vehicle.description}
              </p>
            </div>
            
            {/* Booking Form */}
            {showBookingForm && (
              <div className="mt-10 border-t border-gray-200 pt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Book This Vehicle</h2>
                
                {/* Steps indicator */}
                <div className="mb-8">
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      bookingStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      1
                    </div>
                    <div className={`flex-1 h-1 mx-2 ${
                      bookingStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'
                    }`}></div>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      bookingStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      2
                    </div>
                    <div className={`flex-1 h-1 mx-2 ${
                      bookingStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'
                    }`}></div>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      bookingStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      3
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <div className="text-center w-10">Dates</div>
                    <div className="text-center w-10">Driver</div>
                    <div className="text-center w-10">Confirm</div>
                  </div>
                </div>
                
                {/* Step 1: Choose dates */}
                {bookingStep === 1 && (
                  <form onSubmit={handleCheckAvailability}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700 mb-1">
                          <FaCalendarAlt className="inline mr-2" /> Pickup Date
                        </label>
                        <input
                          type="date"
                          id="pickupDate"
                          name="pickupDate"
                          min={new Date().toISOString().split('T')[0]}
                          value={formData.pickupDate}
                          onChange={handleChange}
                          required
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700 mb-1">
                          <FaCalendarAlt className="inline mr-2" /> Return Date
                        </label>
                        <input
                          type="date"
                          id="returnDate"
                          name="returnDate"
                          min={formData.pickupDate || new Date().toISOString().split('T')[0]}
                          value={formData.returnDate}
                          onChange={handleChange}
                          required
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-between">
                      <button
                        type="button"
                        onClick={resetBookingForm}
                        className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Check Availability
                      </button>
                    </div>
                  </form>
                )}
                
                {/* Step 2: Choose driver */}
                {bookingStep === 2 && (
                  <form onSubmit={handleDriverSelection}>
                    <div className="mb-6">
                      <div className="flex items-center mb-4">
                        <input
                          type="checkbox"
                          id="driverRequired"
                          name="driverRequired"
                          checked={formData.driverRequired}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="driverRequired" className="ml-2 block text-sm text-gray-700">
                          I need a driver for this rental
                        </label>
                      </div>
                      
                      {formData.driverRequired && (
                        <div className="mt-4">
                          <label htmlFor="driverId" className="block text-sm font-medium text-gray-700 mb-1">
                            Select a Driver
                          </label>
                          {loadingDrivers ? (
                            <div className="flex items-center text-gray-500">
                              <FaSpinner className="animate-spin mr-2" /> Loading drivers...
                            </div>
                          ) : drivers.length === 0 ? (
                            <p className="text-gray-500">No drivers available</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {drivers.map(driver => (
                                <div 
                                  key={driver._id}
                                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                    formData.driverId === driver._id
                                      ? 'border-blue-500 bg-blue-50'
                                      : 'border-gray-200 hover:border-blue-300'
                                  }`}
                                  onClick={() => setFormData(prev => ({ ...prev, driverId: driver._id }))}
                                >
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden mr-4">
                                      {driver.imageUrl ? (
                                        <img 
                                          src={driver.imageUrl} 
                                          alt={driver.name} 
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <div className="h-full w-full bg-gray-300 flex items-center justify-center text-gray-600">
                                          <span>{driver.name.charAt(0)}</span>
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-900">{driver.name}</h4>
                                      <div className="mt-1 flex items-center">
                                        <div className="flex items-center">
                                          {[...Array(5)].map((_, i) => (
                                            <svg key={i} className={`h-3 w-3 ${i < Math.floor(driver.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                          ))}
                                          <span className="ml-1 text-xs text-gray-500">{driver.rating}</span>
                                        </div>
                                      </div>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {driver.experience} years experience
                                      </p>
                                      <p className="text-xs font-medium text-blue-600 mt-1">
                                        Rs. {formatPrice(driver.dailyRate)}/day
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6 flex justify-between">
                      <button
                        type="button"
                        onClick={() => setBookingStep(1)}
                        className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        disabled={formData.driverRequired && !formData.driverId}
                      >
                        Continue
                      </button>
                    </div>
                  </form>
                )}
                
                {/* Step 3: Review & Confirm */}
                {bookingStep === 3 && (
                  <form onSubmit={handleBookingSubmit}>
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Summary</h3>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Vehicle:</span>
                          <span className="font-medium">{vehicle.make} {vehicle.model} ({vehicle.year})</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Pickup Date:</span>
                          <span className="font-medium">{new Date(formData.pickupDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Return Date:</span>
                          <span className="font-medium">{new Date(formData.returnDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Rental Duration:</span>
                          <span className="font-medium">{priceDetails.days} day{priceDetails.days !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Driver:</span>
                          <span className="font-medium">
                            {formData.driverRequired ? (
                              drivers.find(d => d._id === formData.driverId)?.name || 'Selected'
                            ) : (
                              'Not Required'
                            )}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                          <FaMoneyBillWave className="mr-2" /> Price Breakdown
                        </h4>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Vehicle Rate:</span>
                          <span>Rs. {formatPrice(vehicle.price)}/day</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Rental Duration:</span>
                          <span>{priceDetails.days} day{priceDetails.days !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Base Rental Price:</span>
                          <span>Rs. {formatPrice(priceDetails.basePrice)}</span>
                        </div>
                        
                        {formData.driverRequired && (
                          <>
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-600">Driver Fee:</span>
                              <span>Rs. {formatPrice(priceDetails.driverPrice)}</span>
                            </div>
                          </>
                        )}
                        
                        <div className="border-t border-blue-200 my-2 pt-2 flex justify-between font-semibold">
                          <span className="text-gray-800">Total Price:</span>
                          <span className="text-blue-800">Rs. {formatPrice(priceDetails.basePrice + priceDetails.driverPrice)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                          Additional Notes (optional)
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          rows="3"
                          value={formData.notes}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Any special requests or information..."
                        ></textarea>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-between">
                      <button
                        type="button"
                        onClick={() => setBookingStep(2)}
                        className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                      >
                        {submitting && <FaSpinner className="animate-spin mr-2" />}
                        Complete Booking
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;
