import { useState } from 'react';
import { AdminNavbar } from '../components/AdminNavbar';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { FaSpinner, FaCar, FaGasPump, FaChair, FaDoorOpen, FaCogs } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CompanyVehicleRegister = () => {
  const navigate = useNavigate();
  const { getAuthHeaders, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    description: '',
    imageUrl: '',
    fuelType: 'Petrol',
    seats: 5,
    doors: 4,
    transmission: 'Manual',
    extraOptions: [],
    ownership: 'Company', // Set to Company by default
    status: 'available'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'extraOptions') {
      // Handle checkboxes for extraOptions
      const updatedOptions = [...formData.extraOptions];
      
      if (checked) {
        updatedOptions.push(value);
      } else {
        const index = updatedOptions.indexOf(value);
        if (index > -1) {
          updatedOptions.splice(index, 1);
        }
      }
      
      setFormData(prev => ({
        ...prev,
        extraOptions: updatedOptions
      }));
    } else {
      // Handle other inputs
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Create the vehicle data object
      const vehicleData = {
        ...formData,
        ownerId: user._id, // Company vehicles are owned by the admin who created them
        price: Number(formData.price),
        year: Number(formData.year)
      };
      
      const response = await axios.post('/api/vehicles', vehicleData, { 
        headers: getAuthHeaders() 
      });
      
      toast.success('Company vehicle registered successfully!');
      navigate('/admin/vehicles-list');
    } catch (error) {
      console.error('Error registering company vehicle:', error);
      toast.error(error.response?.data?.message || 'Failed to register vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Register New Company Vehicle</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="make" className="block text-sm font-medium text-gray-700">Make</label>
                  <input
                    type="text"
                    id="make"
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">Daily Price (Rs.)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL</label>
                  <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div>
                  <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700">
                    <FaGasPump className="inline mr-1" /> Fuel Type
                  </label>
                  <select
                    id="fuelType"
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="seats" className="block text-sm font-medium text-gray-700">
                    <FaChair className="inline mr-1" /> Number of Seats
                  </label>
                  <input
                    type="number"
                    id="seats"
                    name="seats"
                    min="1"
                    max="50"
                    value={formData.seats}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="doors" className="block text-sm font-medium text-gray-700">
                    <FaDoorOpen className="inline mr-1" /> Number of Doors
                  </label>
                  <input
                    type="number"
                    id="doors"
                    name="doors"
                    min="1"
                    max="10"
                    value={formData.doors}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="transmission" className="block text-sm font-medium text-gray-700">
                    <FaCogs className="inline mr-1" /> Transmission
                  </label>
                  <select
                    id="transmission"
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Semi-Automatic">Semi-Automatic</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="available">Available</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCar className="inline mr-1" /> Extra Options
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Air Conditioning', 'GPS', 'Bluetooth', 'Leather Seats', 'Sunroof', 'Child Seats'].map(option => (
                    <div key={option} className="flex items-center">
                      <input
                        id={`option-${option}`}
                        name="extraOptions"
                        type="checkbox"
                        value={option}
                        checked={formData.extraOptions.includes(option)}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`option-${option}`} className="ml-2 block text-sm text-gray-700">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Ownership field - hidden since it's always Company for this form */}
              <input type="hidden" name="ownership" value="Company" />
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/admin/vehicles-list')}
                  className="mr-4 bg-gray-200 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                >
                  {loading && <FaSpinner className="animate-spin mr-2" />}
                  Register Company Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyVehicleRegister;
