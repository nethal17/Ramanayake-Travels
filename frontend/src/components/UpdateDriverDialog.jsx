import { useState, useEffect } from 'react';
import { 
  RiCloseLine, 
  RiSave3Line, 
  RiUser3Line, 
  RiMailLine, 
  RiPhoneLine, 
  RiMapPinLine,
  RiImageAddLine
} from 'react-icons/ri';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const UpdateDriverDialog = ({ isOpen, onClose, driver, onUpdate }) => {
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    if (driver && isOpen) {
      setFormData({
        name: driver.userId?.name || '',
        email: driver.userId?.email || '',
        phone: driver.userId?.phone || '',
        age: driver.age || '',
        address: driver.address || ''
      });
      // Set existing license images
      setPreviewImages({
        frontLicense: driver.drivingLicense?.frontImage 
          ? `http://localhost:5001/uploads/${driver.drivingLicense.frontImage}` 
          : null,
        backLicense: driver.drivingLicense?.backImage 
          ? `http://localhost:5001/uploads/${driver.drivingLicense.backImage}` 
          : null
      });
    }
  }, [driver, isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
    setLoading(true);

    try {
      // Validation
      if (!formData.name || !formData.email || !formData.phone || !formData.age || !formData.address) {
        toast.error('Please fill in all fields');
        return;
      }

      if (parseInt(formData.age) < 18 || parseInt(formData.age) > 70) {
        toast.error('Driver age must be between 18 and 70 years');
        return;
      }

      if (formData.phone.length !== 10) {
        toast.error('Phone number must be 10 digits');
        return;
      }

      // Create FormData
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      
      // Add files if they exist
      if (files.frontLicense) {
        data.append('frontLicense', files.frontLicense);
      }
      if (files.backLicense) {
        data.append('backLicense', files.backLicense);
      }

      const response = await fetch(`http://localhost:5001/api/drivers/${driver._id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders()
        },
        body: data
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Driver updated successfully!');
        onUpdate(); // Refresh the drivers list
        onClose(); // Close the modal
      } else {
        toast.error(result.message || 'Failed to update driver');
      }
    } catch (error) {
      console.error('Error updating driver:', error);
      toast.error('Failed to update driver');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (type) => {
    setFiles(prev => ({ ...prev, [type]: null }));
    setPreviewImages(prev => ({ ...prev, [type]: null }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-[9998]"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="relative bg-white rounded-lg shadow-xl transform transition-all w-full max-w-4xl max-h-[90vh] overflow-hidden z-[9999]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <RiUser3Line className="mr-2 text-blue-600" size={24} />
              Update Driver Details
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
            >
              <RiCloseLine size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                <RiUser3Line className="mr-2 text-blue-600" size={18} />
                Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age *
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    min="18"
                    max="70"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                <RiMailLine className="mr-2 text-blue-600" size={18} />
                Contact Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    pattern="[0-9]{10}"
                    maxLength="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Driving License Images */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                <RiImageAddLine className="mr-2 text-blue-600" size={18} />
                Driving License Images (Optional - leave empty to keep existing)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Front License */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Front Side of License
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 relative">
                    {previewImages.frontLicense ? (
                      <div className="text-center">
                        <img
                          src={previewImages.frontLicense}
                          alt="Front License Preview"
                          className="max-w-full h-32 mx-auto rounded object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage('frontLicense')}
                          className="mt-2 text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <RiImageAddLine className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">Click to upload front side</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'frontLicense')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Back License */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Back Side of License
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 relative">
                    {previewImages.backLicense ? (
                      <div className="text-center">
                        <img
                          src={previewImages.backLicense}
                          alt="Back License Preview"
                          className="max-w-full h-32 mx-auto rounded object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage('backLicense')}
                          className="mt-2 text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <RiImageAddLine className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">Click to upload back side</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'backLicense')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 rounded-md text-white flex items-center ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <RiSave3Line className="mr-2" size={16} />
                    Update Driver
                  </>
                )}
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateDriverDialog;
