import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  RiCheckboxCircleLine, 
  RiCloseCircleLine, 
  RiEyeLine,
  RiGasStationFill,
  RiCarLine,
  RiUserLine,
  RiDoorLine
} from 'react-icons/ri';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const AdminVehicleApplications = () => {
  const { isAuthenticated } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      // Using fetch API instead of axios
      const res = await fetch("/api/admin/vehicles", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`,
          "Content-Type": "application/json"
        },
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
      }
      
      const data = await res.json();
      setVehicles(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setError('Failed to load vehicle applications. Please try again later.');
      
        setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`/api/admin/vehicles/${id}/approve`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`,
          "Content-Type": "application/json"
        },
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error(`Failed to approve: ${res.status}`);
      }
      
      const data = await res.json();
      toast.success(data.message || 'Vehicle application approved successfully');
      
      // Update local state after successful API call
      setVehicles(vehicles.map(v => 
        v._id === id ? {...v, status: 'approved'} : v
      ));
    } catch (error) {
      console.error('Error approving vehicle:', error);
      toast.error('Failed to approve vehicle application. Please try again.');
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch(`/api/admin/vehicles/${id}/reject`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`,
          "Content-Type": "application/json"
        },
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error(`Failed to reject: ${res.status}`);
      }
      
      toast.success('Vehicle application rejected successfully');
      
      // Update local state after successful API call
      setVehicles(vehicles.map(v => 
        v._id === id ? {...v, status: 'rejected'} : v
      ));
    } catch (error) {
      console.error('Error rejecting vehicle:', error);
      toast.error('Failed to reject vehicle application. Please try again.');
    }
  };

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setDetailsModalOpen(true);
  };

  const filteredVehicles = filter === 'all' 
    ? vehicles 
    : vehicles.filter(v => v.status === filter);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Vehicle Applications</h2>
      
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button 
          onClick={() => setFilter('all')} 
          className={`px-4 py-2 rounded-md text-sm ${filter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          All
        </button>
        <button 
          onClick={() => setFilter('pending')} 
          className={`px-4 py-2 rounded-md text-sm ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-800'}`}
        >
          Pending
        </button>
        <button 
          onClick={() => setFilter('approved')} 
          className={`px-4 py-2 rounded-md text-sm ${filter === 'approved' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800'}`}
        >
          Approved
        </button>
        <button 
          onClick={() => setFilter('rejected')} 
          className={`px-4 py-2 rounded-md text-sm ${filter === 'rejected' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-800'}`}
        >
          Rejected
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={fetchVehicles} 
            className="mt-2 px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No vehicle applications found for the selected filter.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specs</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Day</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center">
                        {vehicle.imageUrl ? (
                          <img className="h-10 w-10 rounded-md object-cover" src={vehicle.imageUrl} alt="" />
                        ) : (
                          <span className="text-gray-500 text-xs">No img</span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{vehicle.make || 'Unknown'} {vehicle.model || ''}</div>
                        <div className="text-sm text-gray-500">{vehicle.year || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{vehicle.owner?.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-500">{vehicle.owner?.email || 'No email'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-sm text-gray-700">
                        <RiGasStationFill className="text-blue-500 mr-1" /> 
                        {vehicle.fuelType || 'N/A'}
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <RiCarLine className="text-green-500 mr-1" /> 
                        {vehicle.transmission || 'N/A'}
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <RiUserLine className="text-purple-500 mr-1" /> 
                        {vehicle.seats || 'N/A'} seats
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">LKR {vehicle.price || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${vehicle.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        vehicle.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(vehicle.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewDetails(vehicle)} 
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <RiEyeLine className="mr-1" /> View
                      </button>
                      
                      {vehicle.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApprove(vehicle._id)} 
                            className="text-green-600 hover:text-green-800 flex items-center"
                          >
                            <RiCheckboxCircleLine className="mr-1" /> Approve
                          </button>
                          <button 
                            onClick={() => handleReject(vehicle._id)} 
                            className="text-red-600 hover:text-red-800 flex items-center"
                          >
                            <RiCloseCircleLine className="mr-1" /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {detailsModalOpen && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Vehicle Details</h3>
                <button 
                  onClick={() => setDetailsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center border-b pb-4">
                  <div className="w-full md:w-32 font-medium text-gray-700">Make & Model:</div>
                  <div className="flex-1 text-gray-900">{selectedVehicle.make || 'Unknown'} {selectedVehicle.model || ''} ({selectedVehicle.year || 'N/A'})</div>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center border-b pb-4">
                  <div className="w-full md:w-32 font-medium text-gray-700">Price per day:</div>
                  <div className="flex-1 text-gray-900">LKR {selectedVehicle.price || 0}</div>
                </div>
                
                {/* New Specifications Section */}
                <div className="flex flex-col border-b pb-4">
                  <div className="w-full font-medium text-gray-700 mb-2">Specifications:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center">
                      <RiGasStationFill className="text-blue-500 mr-2" />
                      <div className="flex-1">
                        <span className="text-gray-600 text-sm">Fuel Type:</span>
                        <div className="text-gray-900">{selectedVehicle.fuelType || 'Not specified'}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <RiCarLine className="text-green-500 mr-2" />
                      <div className="flex-1">
                        <span className="text-gray-600 text-sm">Transmission:</span>
                        <div className="text-gray-900">{selectedVehicle.transmission || 'Not specified'}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <RiUserLine className="text-purple-500 mr-2" />
                      <div className="flex-1">
                        <span className="text-gray-600 text-sm">Seats:</span>
                        <div className="text-gray-900">{selectedVehicle.seats || 'Not specified'}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <RiDoorLine className="text-amber-500 mr-2" />
                      <div className="flex-1">
                        <span className="text-gray-600 text-sm">Doors:</span>
                        <div className="text-gray-900">{selectedVehicle.doors || 'Not specified'}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Extra Options Section */}
                {selectedVehicle.extraOptions && selectedVehicle.extraOptions.length > 0 && (
                  <div className="flex flex-col border-b pb-4">
                    <div className="w-full font-medium text-gray-700 mb-2">Extra Options:</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedVehicle.extraOptions.map((option, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
                          {option}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col md:flex-row border-b pb-4">
                  <div className="w-full md:w-32 font-medium text-gray-700">Description:</div>
                  <div className="flex-1 text-gray-900">{selectedVehicle.description || 'No description available'}</div>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center border-b pb-4">
                  <div className="w-full md:w-32 font-medium text-gray-700">Owner:</div>
                  <div className="flex-1 text-gray-900">
                    {selectedVehicle.owner?.name || 'Unknown'}<br />
                    <span className="text-gray-500">{selectedVehicle.owner?.email || 'No email'}</span>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center border-b pb-4">
                  <div className="w-full md:w-32 font-medium text-gray-700">Status:</div>
                  <div className="flex-1">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${selectedVehicle.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        selectedVehicle.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {selectedVehicle.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center">
                  <div className="w-full md:w-32 font-medium text-gray-700">Submitted:</div>
                  <div className="flex-1 text-gray-900">{formatDate(selectedVehicle.createdAt)}</div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setDetailsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
                
                {selectedVehicle.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedVehicle._id);
                        setDetailsModalOpen(false);
                      }}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedVehicle._id);
                        setDetailsModalOpen(false);
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVehicleApplications;
