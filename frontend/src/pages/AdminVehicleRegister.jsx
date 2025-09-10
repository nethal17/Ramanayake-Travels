import { useState } from 'react';
import { AdminNavbar } from '../components/AdminNavbar';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AdminVehicleRegister = () => {
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
    ownership: 'Customer', // Customer vehicle registration
    status: 'available',
    fuelType: 'Petrol',
    transmission: 'Manual',
    seats: 5,
    doors: 4,
    extraOptions: []
  });

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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Create the vehicle data object
      const vehicleData = {
        ...formData,
        ownerId: user._id, // Company vehicles are still owned by the admin who created them
        price: Number(formData.price),
        year: Number(formData.year)
      };
      
      const response = await axios.post('/api/vehicles', vehicleData, { 
        headers: getAuthHeaders() 
      });
      
      toast.success('Customer vehicle registered successfully!');
      navigate('/admin/vehicles-list');
    } catch (error) {
      console.error('Error registering vehicle:', error);
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
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Register New Customer Vehicle</h1>
            <p className="text-gray-600 mb-6">Use this form to register vehicles owned by customers. For company-owned vehicles, use the Company Vehicle form.</p>
            
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
                  <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700">Fuel Type</label>
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
                  <label htmlFor="transmission" className="block text-sm font-medium text-gray-700">Transmission</label>
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
                  <label htmlFor="seats" className="block text-sm font-medium text-gray-700">Number of Seats</label>
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
                  <label htmlFor="doors" className="block text-sm font-medium text-gray-700">Number of Doors</label>
                  <input
                    type="number"
                    id="doors"
                    name="doors"
                    min="1"
                    max="6"
                    value={formData.doors}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Extra Options</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                  Register Customer Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminVehicleRegister;
