import { useState, useEffect } from 'react';
import { AdminNavbar } from '../components/AdminNavbar';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { FaSearch, FaSpinner, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import VehicleDetailsModal from '../components/VehicleDetailsModal';
import VehicleEditModal from '../components/VehicleEditModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminVehiclesList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, company, customer
  const [searchTerm, setSearchTerm] = useState('');
  const { getAuthHeaders } = useAuth();
  
  // Modal states
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, [filter]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      let endpoint = '/api/vehicles';
      
      if (filter === 'company') {
        endpoint = '/api/vehicles/admin/company';
      } else if (filter === 'customer') {
        endpoint = '/api/vehicles/admin/customer';
      }
      
      const response = await axios.get(endpoint, { headers: getAuthHeaders() });
      setVehicles(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to load vehicles');
      setLoading(false);
    }
  };
  
  const handleViewVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDetailsModal(true);
  };
  
  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowEditModal(true);
  };
  
  const handleDeleteVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDeleteModal(true);
  };
  
  const handleSaveVehicle = async (updatedVehicle) => {
    try {
      setIsSaving(true);
      await axios.put(
        `/api/vehicles/${updatedVehicle._id}`, 
        updatedVehicle, 
        { headers: getAuthHeaders() }
      );
      
      // Update the vehicles list
      setVehicles(vehicles.map(vehicle => 
        vehicle._id === updatedVehicle._id ? updatedVehicle : vehicle
      ));
      
      setIsSaving(false);
      setShowEditModal(false);
      toast.success('Vehicle updated successfully');
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast.error('Failed to update vehicle');
      setIsSaving(false);
    }
  };
  
  const handleConfirmDelete = async (vehicleId) => {
    try {
      setIsDeleting(true);
      await axios.delete(
        `/api/vehicles/${vehicleId}`, 
        { headers: getAuthHeaders() }
      );
      
      // Remove from vehicles list
      setVehicles(vehicles.filter(vehicle => vehicle._id !== vehicleId));
      
      setIsDeleting(false);
      setShowDeleteModal(false);
      toast.success('Vehicle deleted successfully');
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Failed to delete vehicle');
      setIsDeleting(false);
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const searchStr = `${vehicle.make} ${vehicle.model} ${vehicle.year}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Vehicles Management</h1>
              
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search vehicles..."
                    className="pl-10 pr-4 py-2 border rounded-md w-full md:w-64"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setFilter('company')}
                    className={`px-4 py-2 rounded-md ${filter === 'company' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    Company
                  </button>
                  <button 
                    onClick={() => setFilter('customer')}
                    className={`px-4 py-2 rounded-md ${filter === 'customer' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    Customer
                  </button>
                </div>
              </div>
            </div>
            
            {loading ? (
              <LoadingSpinner 
                size="md"
                message="Loading vehicles..."
                className="h-64"
              />
            ) : filteredVehicles.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-lg">No vehicles found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredVehicles.map((vehicle) => (
                      <tr key={vehicle._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img 
                                className="h-10 w-10 rounded-full object-cover" 
                                src={vehicle.imageUrl || 'https://via.placeholder.com/150?text=No+Image'} 
                                alt={`${vehicle.make} ${vehicle.model}`} 
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{vehicle.make} {vehicle.model}</div>
                              <div className="text-sm text-gray-500">{vehicle.year}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">Rs. {vehicle.price.toLocaleString()} / day</div>
                          <div className="text-sm text-gray-500">{vehicle.ownership} owned</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {vehicle.ownerId ? (
                              vehicle.ownerId.name || vehicle.ownerId.email || 'Unknown'
                            ) : (
                              'Company'
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            vehicle.status === 'available' ? 'bg-green-100 text-green-800' :
                            vehicle.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                            vehicle.status === 'rented' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            className="text-indigo-600 hover:text-indigo-900 mr-3 flex items-center"
                            onClick={() => handleViewVehicle(vehicle)}
                          >
                            <FaEye className="mr-1" /> View
                          </button>
                          <button 
                            className="text-yellow-600 hover:text-yellow-900 mr-3 flex items-center"
                            onClick={() => handleEditVehicle(vehicle)}
                          >
                            <FaEdit className="mr-1" /> Edit
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900 flex items-center"
                            onClick={() => handleDeleteVehicle(vehicle)}
                          >
                            <FaTrash className="mr-1" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* View Vehicle Modal */}
      {showDetailsModal && selectedVehicle && (
        <VehicleDetailsModal 
          vehicle={selectedVehicle} 
          onClose={() => setShowDetailsModal(false)} 
        />
      )}
      
      {/* Edit Vehicle Modal */}
      {showEditModal && selectedVehicle && (
        <VehicleEditModal
          vehicle={selectedVehicle}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveVehicle}
          isSaving={isSaving}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedVehicle && (
        <DeleteConfirmationModal
          vehicle={selectedVehicle}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default AdminVehiclesList;
