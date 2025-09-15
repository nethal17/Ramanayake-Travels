import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  RiUserAddLine, 
  RiImageAddLine, 
  RiSave3Line, 
  RiArrowLeftLine,
  RiUser3Line,
  RiMailLine,
  RiPhoneLine,
  RiMapPinLine,
  RiCalendarLine,
  RiErrorWarningLine,
  RiCheckLine
} from 'react-icons/ri';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

const AddDriverPage = () => {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    address: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    address: ''
  });
  const [files, setFiles] = useState({
    frontLicense: null,
    backLicense: null
  });
  const [previewImages, setPreviewImages] = useState({
    frontLicense: null,
    backLicense: null
  });

  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePhone = (phone) => {
    // Check if starts with +94 followed by 9 digits
    const re1 = /^\+94\d{9}$/;
    // Check if starts with 0 followed by 9 digits
    const re2 = /^0\d{9}$/;
    return re1.test(phone) || re2.test(phone);
  };

  const validateAge = (age) => {
    const ageNum = parseInt(age);
    return !isNaN(ageNum) && ageNum >= 18 && ageNum <= 70;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate on change
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let errorMessage = '';
    
    switch (name) {
      case 'email':
        if (!value) {
          errorMessage = 'Email is required';
        } else if (!validateEmail(value)) {
          errorMessage = 'Please enter a valid email address';
        }
        break;
      case 'phone':
        if (!value) {
          errorMessage = 'Phone number is required';
        } else if (!validatePhone(value)) {
          errorMessage = 'Phone must start with +94 or 0 followed by 9 digits';
        }
        break;
      case 'age':
        if (!value) {
          errorMessage = 'Age is required';
        } else if (!validateAge(value)) {
          errorMessage = 'Age must be between 18 and 70';
        }
        break;
      default:
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));
    
    return !errorMessage;
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }

      setFiles(prev => ({
        ...prev,
        [type]: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImages(prev => ({
          ...prev,
          [type]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const isNameValid = validateField('name', formData.name);
    const isEmailValid = validateField('email', formData.email);
    const isPhoneValid = validateField('phone', formData.phone);
    const isAgeValid = validateField('age', formData.age);
    const isAddressValid = validateField('address', formData.address);
    
    if (!isNameValid || !isEmailValid || !isPhoneValid || !isAgeValid || !isAddressValid) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    if (!files.frontLicense || !files.backLicense) {
      toast.error('Please upload both front and back images of driving license');
      return;
    }
    
    setLoading(true);

    try {
      // Create FormData
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      data.append('frontLicense', files.frontLicense);
      data.append('backLicense', files.backLicense);

      const response = await fetch('http://localhost:5001/api/drivers/create', {
        method: 'POST',
        headers: {
          ...getAuthHeaders()
        },
        body: data
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Driver created successfully! Verification email sent.');
        navigate('/admin/driver-list');
      } else {
        toast.error(result.message || 'Failed to create driver');
      }
    } catch (error) {
      console.error('Error creating driver:', error);
      toast.error('Failed to create driver');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/driver-list')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <RiArrowLeftLine className="mr-2" size={20} />
            Back to Driver List
          </button>
          <div className="flex items-center">
            <RiUserAddLine className="mr-3 text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Add New Driver</h1>
          </div>
          <p className="mt-2 text-gray-600">Create a new driver account and send verification email</p>
        </div>

        {/* Form */}
        <div className="bg-white shadow-lg rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <RiUser3Line className="mr-2 text-blue-600" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500 bg-red-50' : formData.name ? 'border-green-500 bg-green-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter driver's full name"
                    required
                  />
                  {formData.name && !errors.name && (
                    <RiCheckLine className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                  )}
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      min="18"
                      max="70"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.age ? 'border-red-500 bg-red-50' : formData.age ? 'border-green-500 bg-green-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter age (18-70)"
                      required
                    />
                    {formData.age && !errors.age && (
                      <RiCheckLine className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                    )}
                    {errors.age && (
                      <RiErrorWarningLine className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" />
                    )}
                  </div>
                  {errors.age && (
                    <p className="mt-1 text-sm text-red-600">{errors.age}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <RiMailLine className="mr-2 text-blue-600" />
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.email ? 'border-red-500 bg-red-50' : formData.email ? 'border-green-500 bg-green-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter email address"
                      required
                    />
                    {formData.email && !errors.email && (
                      <RiCheckLine className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                    )}
                    {errors.email && (
                      <RiErrorWarningLine className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" />
                    )}
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.phone ? 'border-red-500 bg-red-50' : formData.phone ? 'border-green-500 bg-green-50' : 'border-gray-300'
                      }`}
                      placeholder="Format: +94XXXXXXXXX or 0XXXXXXXXX"
                      required
                    />
                    {formData.phone && !errors.phone && (
                      <RiCheckLine className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                    )}
                    {errors.phone && (
                      <RiErrorWarningLine className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" />
                    )}
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Must start with +94 or 0, followed by 9 digits
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <div className="relative">
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.address ? 'border-red-500 bg-red-50' : formData.address ? 'border-green-500 bg-green-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter complete address"
                    required
                  />
                  {formData.address && !errors.address && (
                    <RiCheckLine className="absolute right-3 top-4 text-green-500" />
                  )}
                </div>
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
              </div>
            </div>

            {/* Driving License */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <RiImageAddLine className="mr-2 text-blue-600" />
                Driving License Images
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Front License */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Front Side of License *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 relative">
                    {previewImages.frontLicense ? (
                      <div className="text-center">
                        <img
                          src={previewImages.frontLicense}
                          alt="Front License Preview"
                          className="max-w-full h-40 mx-auto rounded object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFiles(prev => ({ ...prev, frontLicense: null }));
                            setPreviewImages(prev => ({ ...prev, frontLicense: null }));
                          }}
                          className="mt-2 text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <RiImageAddLine className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">Click to upload front side</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'frontLicense')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                  </div>
                </div>

                {/* Back License */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Back Side of License *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 relative">
                    {previewImages.backLicense ? (
                      <div className="text-center">
                        <img
                          src={previewImages.backLicense}
                          alt="Back License Preview"
                          className="max-w-full h-40 mx-auto rounded object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFiles(prev => ({ ...prev, backLicense: null }));
                            setPreviewImages(prev => ({ ...prev, backLicense: null }));
                          }}
                          className="mt-2 text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <RiImageAddLine className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">Click to upload back side</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'backLicense')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                  </div>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Upload clear images of both sides of the driving license. Maximum file size: 5MB
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate('/admin/driver-list')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded-lg text-white flex items-center ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <RiSave3Line className="mr-2" size={18} />
                    Create Driver
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 mb-2">What happens next?</h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• Driver account will be created with auto-generated password</li>
            <li>• Verification email will be sent to the driver's email address</li>
            <li>• After email verification, login credentials will be sent via email</li>
            <li>• Driver can then log in to the system using the provided credentials</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddDriverPage;
