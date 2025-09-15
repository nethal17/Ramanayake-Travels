import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaArrowRight, FaArrowLeft, FaCheck } from 'react-icons/fa';

const VehicleEditModal = ({ vehicle, onClose, onSave, isSaving }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    description: '',
    imageUrl: '',
    status: 'available',
    fuelType: 'Petrol',
    transmission: 'Manual',
    seats: 5,
    doors: 4,
    extraOptions: []
  });
  const [imageUrlError, setImageUrlError] = useState('');

  useEffect(() => {
    if (vehicle) {
      const updatedFormData = {
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || new Date().getFullYear(),
        price: vehicle.price || '',
        description: vehicle.description || '',
        imageUrl: vehicle.imageUrl || '',
        status: vehicle.status || 'available',
        fuelType: vehicle.fuelType || 'Petrol',
        transmission: vehicle.transmission || 'Manual',
        seats: vehicle.seats || 5,
        doors: vehicle.doors || 4,
        extraOptions: vehicle.extraOptions || []
      };
      
      setFormData(updatedFormData);
      
      // Validate the image URL when data is loaded
      if (updatedFormData.imageUrl) {
        validateImageUrl(updatedFormData.imageUrl);
      }
    }
  }, [vehicle]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'extraOptions' && type === 'checkbox') {
      // Handle checkboxes for extraOptions array
      if (checked) {
        setFormData(prev => ({
          ...prev,
          extraOptions: [...prev.extraOptions, value]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          extraOptions: prev.extraOptions.filter(option => option !== value)
        }));
      }
    } else {
      // Handle regular inputs
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Validate image URL
      if (name === 'imageUrl') {
        validateImageUrl(value);
      }
    }
  };

  const validateImageUrl = (url) => {
    if (!url) {
      setImageUrlError('');
      return;
    }
    
    try {
      new URL(url);
      setImageUrlError('');
    } catch (e) {
      setImageUrlError('Please enter a valid URL (e.g., https://example.com/image.jpg)');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, _id: vehicle._id });
  };

  const nextStep = () => {
    setStep(2);
  };

  const prevStep = () => {
    setStep(1);
  };

  // Check if first step fields are valid
  const isStepOneValid = () => {
    // Don't allow proceeding if there's an image URL error
    if (imageUrlError) {
      return false;
    }
    
    return (
      formData.make.trim() !== '' &&
      formData.model.trim() !== '' &&
      formData.year &&
      formData.price &&
      formData.fuelType &&
      formData.transmission
    );
  };

  if (!vehicle) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-90vh overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Edit Vehicle</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <FaTimes size={24} />
          </button>
        </div>
        
        {/* Step Indicator */}
        <div className="px-6 pt-2">
          <div className="flex items-center">
            <div 
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 
                ${step === 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-blue-600 bg-white text-blue-600'}`}
            >
              1
            </div>
            <div className={`flex-1 h-1 mx-2 ${step === 1 ? 'bg-gray-300' : 'bg-blue-600'}`}></div>
            <div 
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 
                ${step === 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-blue-600 bg-white text-blue-600'}`}
            >
              2
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <div className={step === 1 ? 'font-bold text-blue-600' : ''}>Basic Details</div>
            <div className={step === 2 ? 'font-bold text-blue-600' : ''}>Additional Info</div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-4">
            {step === 1 ? (
              /* Step 1: Basic Vehicle Information */
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                    <input
                      type="text"
                      id="make"
                      name="make"
                      value={formData.make}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                    <input
                      type="text"
                      id="model"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <input
                      type="number"
                      id="year"
                      name="year"
                      min="1990"
                      max={new Date().getFullYear() + 1}
                      value={formData.year}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Daily Price (Rs.)</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      min="0"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                    <select
                      id="fuelType"
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="transmission" className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
                    <select
                      id="transmission"
                      name="transmission"
                      value={formData.transmission}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                      <option value="Semi-Automatic">Semi-Automatic</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="available">Available</option>
                      <option value="rented">Rented</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                      type="url"
                      id="imageUrl"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleChange}
                      className={`w-full border ${imageUrlError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="https://example.com/image.jpg"
                    />
                    {imageUrlError && (
                      <p className="mt-1 text-sm text-red-600">{imageUrlError}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Step 2: Additional Vehicle Information */
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="seats" className="block text-sm font-medium text-gray-700 mb-1">Number of Seats</label>
                    <input
                      type="number"
                      id="seats"
                      name="seats"
                      min="1"
                      max="50"
                      value={formData.seats}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="doors" className="block text-sm font-medium text-gray-700 mb-1">Number of Doors</label>
                    <input
                      type="number"
                      id="doors"
                      name="doors"
                      min="1"
                      max="6"
                      value={formData.doors}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Extra Options</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="ac"
                        name="extraOptions"
                        value="Air Conditioning"
                        checked={formData.extraOptions.includes('Air Conditioning')}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="ac" className="ml-2 block text-sm text-gray-700">Air Conditioning</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="gps"
                        name="extraOptions"
                        value="GPS"
                        checked={formData.extraOptions.includes('GPS')}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="gps" className="ml-2 block text-sm text-gray-700">GPS</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="bluetooth"
                        name="extraOptions"
                        value="Bluetooth"
                        checked={formData.extraOptions.includes('Bluetooth')}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="bluetooth" className="ml-2 block text-sm text-gray-700">Bluetooth</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="leather"
                        name="extraOptions"
                        value="Leather Seats"
                        checked={formData.extraOptions.includes('Leather Seats')}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="leather" className="ml-2 block text-sm text-gray-700">Leather Seats</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="sunroof"
                        name="extraOptions"
                        value="Sunroof"
                        checked={formData.extraOptions.includes('Sunroof')}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="sunroof" className="ml-2 block text-sm text-gray-700">Sunroof</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="childSeats"
                        name="extraOptions"
                        value="Child Seats"
                        checked={formData.extraOptions.includes('Child Seats')}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="childSeats" className="ml-2 block text-sm text-gray-700">Child Seats</label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t bg-gray-50 flex justify-between">
            {step === 1 ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepOneValid()}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    isStepOneValid() 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Next <FaArrowRight className="ml-2" />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
                >
                  <FaArrowLeft className="mr-2" /> Back
                </button>
                <div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 mr-2"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaCheck className="mr-2" /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleEditModal;