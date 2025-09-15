import { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaCarCrash, FaCommentAlt, FaPaperPlane, FaMapMarkerAlt, FaImage, FaTimes } from 'react-icons/fa';
import api from '../api/axios';
import toast from 'react-hot-toast';

const DriverInquiryForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    type: 'breakdown',
    subject: '',
    description: '',
    location: '',
    tripId: '',
    vehicleId: '',
    priority: 'medium'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  
  useEffect(() => {
    // Fetch driver's assigned trips
    const fetchTrips = async () => {
      try {
        const response = await api.get('/reservations/driver', { withCredentials: true });
        if (response.data) {
          setTrips(response.data.filter(trip => trip.status === 'confirmed' || trip.status === 'in-progress'));
        }
      } catch (error) {
        console.error('Error fetching trips:', error);
      }
    };
    
    // Fetch driver's assigned vehicles
    const fetchVehicles = async () => {
      try {
        const response = await api.get('/drivers/profile', { withCredentials: true });
        if (response.data.success && response.data.assignedVehicles) {
          setVehicles(response.data.assignedVehicles);
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      }
    };
    
    fetchTrips();
    fetchVehicles();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate total number of images
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    
    // Create previews for selected images
    const newImagePreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setImages(prev => [...prev, ...files]);
    setImagePreview(prev => [...prev, ...newImagePreviews]);
  };
  
  const removeImage = (index) => {
    setImages(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    
    setImagePreview(prev => {
      const updated = [...prev];
      // Revoke the object URL to avoid memory leaks
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.description.trim()) {
      toast.error('Subject and description are required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create form data for multipart submission
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });
      
      // Add images to form data
      images.forEach(image => {
        submitData.append('images', image);
      });
      
      const response = await api.post('/inquiries/create', submitData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        toast.success('Inquiry submitted successfully');
        // Reset form
        setFormData({
          type: 'breakdown',
          subject: '',
          description: '',
          location: '',
          tripId: '',
          vehicleId: '',
          priority: 'medium'
        });
        setImages([]);
        setImagePreview([]);
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast.error(error.response?.data?.message || 'Failed to submit inquiry');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getTypeIcon = (type) => {
    switch (type) {
      case 'breakdown':
        return <FaCarCrash className="text-red-500" />;
      case 'complaint':
        return <FaCommentAlt className="text-yellow-500" />;
      case 'other':
        return <FaExclamationTriangle className="text-blue-500" />;
      default:
        return <FaExclamationTriangle className="text-blue-500" />;
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FaExclamationTriangle className="mr-2 text-yellow-500" />
        Submit New Inquiry
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Inquiry Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Inquiry Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'breakdown' }))}
              className={`flex items-center justify-center p-3 rounded-md border ${
                formData.type === 'breakdown' 
                  ? 'border-red-500 bg-red-50 text-red-700' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FaCarCrash className="mr-2" />
              <span>Breakdown</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'complaint' }))}
              className={`flex items-center justify-center p-3 rounded-md border ${
                formData.type === 'complaint' 
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-700' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FaCommentAlt className="mr-2" />
              <span>Complaint</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'other' }))}
              className={`flex items-center justify-center p-3 rounded-md border ${
                formData.type === 'other' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FaExclamationTriangle className="mr-2" />
              <span>Other</span>
            </button>
          </div>
        </div>
        
        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief subject of your inquiry"
            required
          />
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Detailed description of the issue"
            required
          ></textarea>
        </div>
        
        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            <FaMapMarkerAlt className="inline-block mr-1" /> Location (Optional)
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Current location or address where the issue occurred"
          />
        </div>
        
        {/* Related Trip and Vehicle Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Trip Selection */}
          <div>
            <label htmlFor="tripId" className="block text-sm font-medium text-gray-700 mb-1">
              Related Trip (Optional)
            </label>
            <select
              id="tripId"
              name="tripId"
              value={formData.tripId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Trip --</option>
              {trips.map(trip => (
                <option key={trip._id} value={trip._id}>
                  {trip.pickupLocation} to {trip.dropoffLocation} ({new Date(trip.pickupDate).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
          
          {/* Vehicle Selection */}
          <div>
            <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700 mb-1">
              Related Vehicle (Optional)
            </label>
            <select
              id="vehicleId"
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Vehicle --</option>
              {vehicles.map(vehicle => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.make} {vehicle.model} ({vehicle.registrationNumber})
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Priority Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <div className="flex space-x-2">
            {['low', 'medium', 'high', 'urgent'].map(priority => (
              <button
                key={priority}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, priority }))}
                className={`px-4 py-2 rounded-md border ${
                  formData.priority === priority
                    ? `border-${priority === 'low' ? 'blue' : priority === 'medium' ? 'green' : priority === 'high' ? 'yellow' : 'red'}-500 
                       bg-${priority === 'low' ? 'blue' : priority === 'medium' ? 'green' : priority === 'high' ? 'yellow' : 'red'}-50 
                       text-${priority === 'low' ? 'blue' : priority === 'medium' ? 'green' : priority === 'high' ? 'yellow' : 'red'}-700`
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FaImage className="inline-block mr-1" /> Attach Images (Optional, max 5)
          </label>
          <div className="flex items-center space-x-2">
            <label className="cursor-pointer px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
              <FaImage className="inline-block mr-1" />
              <span>Select Images</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={images.length >= 5}
              />
            </label>
            <span className="text-xs text-gray-500">
              {images.length}/5 images selected
            </span>
          </div>
          
          {/* Image Previews */}
          {imagePreview.length > 0 && (
            <div className="mt-2 grid grid-cols-5 gap-2">
              {imagePreview.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image.preview}
                    alt={`Preview ${index + 1}`}
                    className="h-24 w-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            disabled={isSubmitting || !formData.subject || !formData.description}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <FaPaperPlane className="mr-2" />
                Submit Inquiry
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DriverInquiryForm;
