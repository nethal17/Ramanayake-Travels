import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export const VehicleRegistrationForm = () => {
  const { isAuthenticated, user, getAuthHeaders } = useAuth();
  // Form state
  const [form, setForm] = useState({
    make: "",
    model: "",
    year: "",
    price: "",
    description: "",
    fuelType: "Petrol",
    seats: "",
    doors: "",
    transmission: "Manual",
    extraOptions: [],
    image: null,
  });
  // Form validation errors
  const [errors, setErrors] = useState({});
  // UI states
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Scroll form into view to avoid navbar overlap
  useEffect(() => {
    const formElement = document.getElementById("vehicle-registration-form");
    if (formElement) {
      // Add a slight delay to ensure proper scrolling after render
      setTimeout(() => {
        window.scrollTo({
          top: formElement.offsetTop - 100, // Offset to account for navbar
          behavior: "smooth"
        });
      }, 100);
    }
  }, [currentStep]);

  if (!isAuthenticated) {
    return <div className="p-6 text-center">Please sign in to register a vehicle for rent.</div>;
  }

  // Validate form inputs
  const validateForm = (step) => {
    const newErrors = {};
    const currentYear = new Date().getFullYear();
    
    if (step === 1) {
      // Step 1 validation
      if (!form.make.trim()) newErrors.make = "Make is required";
      if (!form.model.trim()) newErrors.model = "Model is required";
      
      // Year validation: must be valid and not in the future
      if (!form.year) {
        newErrors.year = "Year is required";
      } else if (parseInt(form.year) > currentYear) {
        newErrors.year = `Year cannot be in the future (max: ${currentYear})`;
      } else if (parseInt(form.year) < 1900) {
        newErrors.year = "Please enter a valid year (min: 1900)";
      }
      
      // Price validation: must be at least 100 LKR
      if (!form.price) {
        newErrors.price = "Price is required";
      } else if (parseInt(form.price) < 100) {
        newErrors.price = "Price must be at least 100 LKR";
      }
    }
    
    if (step === 2) {
      // Step 2 validation
      // Seats validation: must be at least 1
      if (!form.seats) {
        newErrors.seats = "Number of seats is required";
      } else if (parseInt(form.seats) < 1) {
        newErrors.seats = "Vehicle must have at least 1 seat";
      }
      
      // Doors validation: must be at least 1
      if (!form.doors) {
        newErrors.doors = "Number of doors is required";
      } else if (parseInt(form.doors) < 1) {
        newErrors.doors = "Vehicle must have at least 1 door";
      }
      
      // Description validation: must be at least 20 characters
      if (!form.description.trim()) {
        newErrors.description = "Description is required";
      } else if (form.description.length < 20) {
        newErrors.description = "Description should be at least 20 characters";
      }
    }
    
    // Update errors state and return validation result
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step button
  const handleNextStep = () => {
    if (validateForm(1)) {
      setCurrentStep(2);
    }
  };

  // Handle back button
  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    
    // Handle file uploads
    if (files) {
      setForm((prev) => ({
        ...prev,
        [name]: files[0],
      }));
      return;
    }
    
    // Handle checkboxes for extra options
    if (type === 'checkbox') {
      const options = [...form.extraOptions];
      if (checked) {
        options.push(value);
      } else {
        const index = options.indexOf(value);
        if (index > -1) {
          options.splice(index, 1);
        }
      }
      setForm((prev) => ({
        ...prev,
        extraOptions: options,
      }));
      return;
    }
    
    // Handle other inputs
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Real-time validation for specific fields
    const newErrors = { ...errors };
    const currentYear = new Date().getFullYear();
    
    // Clear error when user starts typing
    if (value.trim()) {
      delete newErrors[name];
    }
    
    // Specific field validations
    if (name === 'year' && value) {
      if (parseInt(value) > currentYear) {
        newErrors.year = `Year cannot be in the future (max: ${currentYear})`;
      } else if (parseInt(value) < 1900) {
        newErrors.year = "Please enter a valid year (min: 1900)";
      } else {
        delete newErrors.year;
      }
    }
    
    if (name === 'price' && value) {
      if (parseInt(value) < 100) {
        newErrors.price = "Price must be at least 100 LKR";
      } else {
        delete newErrors.price;
      }
    }
    
    if (name === 'seats' && value) {
      if (parseInt(value) < 1) {
        newErrors.seats = "Vehicle must have at least 1 seat";
      } else {
        delete newErrors.seats;
      }
    }
    
    if (name === 'description' && value.trim()) {
      if (value.length < 20) {
        newErrors.description = "Description should be at least 20 characters";
      } else {
        delete newErrors.description;
      }
    }
    
    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate the current step before submission
    if (!validateForm(currentStep)) {
      toast.error("Please fix the errors before submitting");
      return;
    }
    
    setLoading(true);
    const formData = new FormData();
    
    // Add all form fields to FormData
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'extraOptions' && Array.isArray(value)) {
        // Handle array of extra options
        value.forEach(option => formData.append('extraOptions', option));
      } else if (key !== 'image') { // Skip image as it's handled separately
        formData.append(key, value);
      }
    });
    
    // Add image file if it exists
    if (form.image) {
      formData.append('image', form.image);
    }
    
    // Add user ID if available
    if (user && user._id) {
      formData.append('ownerId', user._id);
      console.log('Including owner ID in form submission:', user._id);
    }
    
    try {
      // When using FormData, don't set Content-Type as it will be set automatically with the correct boundary
      const token = localStorage.getItem('token');
      
      console.log('Token exists:', !!token);
      
      const res = await fetch("http://localhost:5001/api/vehicles/register", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Server error response:', errorData);
        throw new Error(errorData.error || "Failed to register vehicle");
      }
      
      const data = await res.json();
      console.log('Vehicle registered successfully:', data);
      toast.success("Vehicle registered successfully!");
      // Reset form
      setForm({ 
        make: "", 
        model: "", 
        year: "", 
        price: "", 
        description: "", 
        fuelType: "Petrol",
        seats: "",
        doors: "",
        transmission: "Manual",
        extraOptions: [],
        image: null 
      });
      // Reset to first step
      setCurrentStep(1);
      setErrors({});
    } catch (err) {
      console.error('Registration error:', err);
      let errorMessage = "Failed to register vehicle";
      
      // Try to extract more specific error message if available
      if (err.message && err.message !== "Failed to register vehicle") {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper function for input styling based on error state
  const getInputClassName = (field) => {
    return `w-full border ${errors[field] ? 'border-red-500' : 'border-gray-300'} rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500`;
  };

  return (
    <div className="max-w-lg mx-auto p-4 mt-16" id="vehicle-registration-form">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Form Header with Step Indicator */}
        <div className="bg-blue-600 text-white p-4">
          <h2 className="text-xl font-bold mb-2">Register Your Vehicle for Rent</h2>
          <div className="flex justify-between items-center">
            <div className="text-sm">Step {currentStep} of 2</div>
            <div className="flex">
              <div className={`w-10 h-1 rounded mr-1 ${currentStep === 1 ? 'bg-white' : 'bg-blue-300'}`}></div>
              <div className={`w-10 h-1 rounded ${currentStep === 2 ? 'bg-white' : 'bg-blue-300'}`}></div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} encType="multipart/form-data" className="p-5">
          {/* Step 1: Basic Vehicle Information */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-semibold mb-4">Vehicle Information</h3>
              
              <div className="mb-3">
                <label className="block mb-1 font-medium">Make <span className="text-red-500">*</span></label>
                <input 
                  name="make" 
                  value={form.make} 
                  onChange={handleChange} 
                  className={getInputClassName('make')}
                  placeholder="e.g., Toyota" 
                />
                {errors.make && <p className="text-red-500 text-sm mt-1">{errors.make}</p>}
              </div>
              
              <div className="mb-3">
                <label className="block mb-1 font-medium">Model <span className="text-red-500">*</span></label>
                <input 
                  name="model" 
                  value={form.model} 
                  onChange={handleChange}
                  className={getInputClassName('model')}
                  placeholder="e.g., Corolla" 
                />
                {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block mb-1 font-medium">Year <span className="text-red-500">*</span></label>
                  <input 
                    name="year" 
                    value={form.year} 
                    onChange={handleChange}
                    type="number" 
                    className={getInputClassName('year')}
                    placeholder={`Max: ${new Date().getFullYear()}`}
                  />
                  {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
                </div>
                
                <div>
                  <label className="block mb-1 font-medium">Price per day (LKR) <span className="text-red-500">*</span></label>
                  <input 
                    name="price" 
                    value={form.price} 
                    onChange={handleChange}
                    type="number" 
                    className={getInputClassName('price')}
                    placeholder="Min: 100 LKR" 
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button 
                  type="button" 
                  onClick={handleNextStep}
                  className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 transition-colors"
                >
                  Next
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Specifications and Details */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-semibold mb-4">Vehicle Specifications</h3>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block mb-1 font-medium">Fuel Type</label>
                  <select name="fuelType" value={form.fuelType} onChange={handleChange} className="w-full border rounded p-2">
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block mb-1 font-medium">Transmission</label>
                  <select name="transmission" value={form.transmission} onChange={handleChange} className="w-full border rounded p-2">
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Semi-Automatic">Semi-Automatic</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block mb-1 font-medium">Number of Seats <span className="text-red-500">*</span></label>
                  <input 
                    name="seats" 
                    value={form.seats} 
                    onChange={handleChange}
                    type="number" 
                    min="1" 
                    max="50" 
                    className={getInputClassName('seats')}
                    placeholder="Min: 1" 
                  />
                  {errors.seats && <p className="text-red-500 text-sm mt-1">{errors.seats}</p>}
                </div>
                
                <div>
                  <label className="block mb-1 font-medium">Number of Doors <span className="text-red-500">*</span></label>
                  <input 
                    name="doors" 
                    value={form.doors} 
                    onChange={handleChange}
                    type="number" 
                    min="1" 
                    max="6" 
                    className={getInputClassName('doors')}
                    placeholder="Min: 1" 
                  />
                  {errors.doors && <p className="text-red-500 text-sm mt-1">{errors.doors}</p>}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block mb-1 font-medium">Extra Options</label>
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="extraOptions" value="Air Conditioning" checked={form.extraOptions.includes('Air Conditioning')} onChange={handleChange} className="rounded" />
                    <span>Air Conditioning</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="extraOptions" value="GPS" checked={form.extraOptions.includes('GPS')} onChange={handleChange} className="rounded" />
                    <span>GPS</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="extraOptions" value="Bluetooth" checked={form.extraOptions.includes('Bluetooth')} onChange={handleChange} className="rounded" />
                    <span>Bluetooth</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="extraOptions" value="Leather Seats" checked={form.extraOptions.includes('Leather Seats')} onChange={handleChange} className="rounded" />
                    <span>Leather Seats</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="extraOptions" value="Sunroof" checked={form.extraOptions.includes('Sunroof')} onChange={handleChange} className="rounded" />
                    <span>Sunroof</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="extraOptions" value="Child Seats" checked={form.extraOptions.includes('Child Seats')} onChange={handleChange} className="rounded" />
                    <span>Child Seats</span>
                  </label>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block mb-1 font-medium">Description <span className="text-red-500">*</span></label>
                <textarea 
                  name="description" 
                  value={form.description} 
                  onChange={handleChange}
                  className={getInputClassName('description')}
                  placeholder="Provide details about your vehicle (min 20 characters)"
                  rows="3" 
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>
              
              <div className="mb-4">
                <label className="block mb-1 font-medium">Vehicle Image</label>
                <input 
                  name="image" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded p-2" 
                />
              </div>
              
              <div className="mt-6 flex justify-between">
                <button 
                  type="button" 
                  onClick={handlePrevStep}
                  className="bg-gray-300 text-gray-800 py-2 px-6 rounded hover:bg-gray-400 transition-colors"
                >
                  Back
                </button>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                >
                  {loading ? "Registering..." : "Register Vehicle"}
                </button>
              </div>
            </motion.div>
          )}
        </form>
      </div>
    </div>
  );
};
