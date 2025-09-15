import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FaTools, FaPlus, FaEdit, FaTrash, FaSearch, FaCar, FaCalendarAlt, FaUser, FaEye, FaCheckCircle, FaReceipt, FaFileAlt } from 'react-icons/fa';
import { format } from 'date-fns';

const AdminMaintenanceManagement = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', or 'viewCompleted'
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [formData, setFormData] = useState({
    vehicleId: '',
    scheduledDate: '',
    maintenanceType: '',
    description: '',
    estimatedCost: '',
    assignedTechnicianId: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterVehicle, setFilterVehicle] = useState('all');
  const [filterTechnician, setFilterTechnician] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Fetch all necessary data on component mount
  useEffect(() => {
    fetchMaintenanceRecords();
    fetchVehicles();
    fetchTechnicians();
  }, []);

  const fetchMaintenanceRecords = async () => {
    try {
      setLoading(true);
      const response = await api.get('/maintenance', {
        withCredentials: true
      });
      
      // Log response for debugging
      console.log('Maintenance response:', response.data);
      
      // Handle both possible response shapes
      if (response.data) {
        if (Array.isArray(response.data)) {
          // Direct array response
          setMaintenanceRecords(response.data);
        } else if (response.data.success && Array.isArray(response.data.data)) {
          // Success with data array
          setMaintenanceRecords(response.data.data);
        } else if (Array.isArray(response.data.maintenance)) {
          // Alternative shape with maintenance array
          setMaintenanceRecords(response.data.maintenance);
        } else {
          toast.error('Unexpected response format from maintenance API');
          console.error('Unexpected response format:', response.data);
          setMaintenanceRecords([]);
        }
      } else {
        toast.error('No data received from maintenance API');
        setMaintenanceRecords([]);
      }
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
      toast.error(error.response?.data?.message || 'Error loading maintenance records');
      setMaintenanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      // Use the specific endpoint for company vehicles as defined in your backend routes
      const response = await api.get('/vehicles/admin/company', {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Log response for debugging
      console.log('Vehicles response:', response.data);
      
      // Handle different response shapes
      let vehiclesArray = [];
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          // Direct array response - this is the expected format from /vehicles/admin/company
          // The controller returns Vehicle.find({ ownership: 'Company' })
          vehiclesArray = response.data;
          console.log('Found array of vehicles directly in response.data:', vehiclesArray.length);
        } else if (Array.isArray(response.data.data)) {
          // Response with data array
          vehiclesArray = response.data.data;
          console.log('Found array of vehicles in response.data.data:', vehiclesArray.length);
        } else if (Array.isArray(response.data.vehicles)) {
          // Alternative shape with vehicles array
          vehiclesArray = response.data.vehicles;
          console.log('Found array of vehicles in response.data.vehicles:', vehiclesArray.length);
        } else {
          console.log('Unexpected response format:', response.data);
        }
        
        setVehicles(vehiclesArray || []);
        
        if (vehiclesArray.length === 0) {
          console.log('No company vehicles found in the database');
          toast('No company vehicles found', { icon: '⚠️' });
        }
      } else {
        toast.error('No data received from vehicles API');
        setVehicles([]);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      if (error.response) {
        console.log('Error response data:', error.response.data);
        console.log('Error response status:', error.response.status);
      } else if (error.request) {
        console.log('No response received:', error.request);
      } else {
        console.log('Error setting up request:', error.message);
      }
      toast.error(error.response?.data?.message || 'Error loading vehicles');
      setVehicles([]);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const response = await api.get('/technicians', {
        withCredentials: true
      });

      // Log response for debugging
      console.log('Technicians response:', response.data);
      
      // Handle different response shapes
      let techniciansArray = [];
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          // Direct array response
          techniciansArray = response.data;
        } else if (response.data.success && Array.isArray(response.data.data)) {
          // Success with data array
          techniciansArray = response.data.data;
        } else if (Array.isArray(response.data.technicians)) {
          // Alternative shape with technicians array
          techniciansArray = response.data.technicians;
        }
        
        // Filter available technicians regardless of response shape
        const availableTechnicians = techniciansArray.filter(technician => 
          technician.availability
        );
        
        setTechnicians(availableTechnicians || []);
        
        if (availableTechnicians.length === 0) {
          console.log('No available technicians found in:', techniciansArray);
          toast.warning('No available technicians found');
        }
      } else {
        toast.error('No data received from technicians API');
        setTechnicians([]);
      }
    } catch (error) {
      console.error('Error fetching technicians:', error);
      toast.error(error.response?.data?.message || 'Error loading technicians');
      setTechnicians([]);
    }
  };

  const handleOpenModal = (mode, maintenance = null) => {
    console.log('Opening modal in mode:', mode);
    console.log('Maintenance record for editing:', maintenance);
    
    setModalMode(mode);
    setSelectedMaintenance(maintenance);

    if (mode === 'create') {
      // Reset form for create
      setFormData({
        vehicleId: '',
        scheduledDate: format(new Date(), 'yyyy-MM-dd'),
        maintenanceType: '',
        description: '',
        estimatedCost: '',
        assignedTechnicianId: ''
      });
    } else if (mode === 'edit' && maintenance) {
      // For debugging
      console.log('Populating form with:', {
        vehicleId: maintenance.vehicleId?._id || maintenance.vehicle?._id || '',
        scheduledDate: maintenance.scheduledDate,
        maintenanceType: maintenance.maintenanceType,
        description: maintenance.description,
        cost: maintenance.cost,
        technicianId: maintenance.technicianId?._id
      });
      
      
      // Populate form for edit - map backend field names to form field names
      const maintenanceType = maintenance.maintenanceType || '';
      // Log what we're setting to help with debugging
      console.log('Setting maintenanceType in form:', maintenanceType);
      
      setFormData({
        vehicleId: maintenance.vehicleId?._id || maintenance.vehicle?._id || '',
        scheduledDate: maintenance.scheduledDate 
          ? format(new Date(maintenance.scheduledDate), 'yyyy-MM-dd') 
          : '',
        maintenanceType: maintenanceType,
        description: maintenance.description || '',
        estimatedCost: maintenance.cost || maintenance.estimatedCost || '',
        assignedTechnicianId: maintenance.technicianId?._id || maintenance.assignedTechnician?._id || ''
      });
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted!', formData);
    
    try {
      // Prepare the data with correct field names for the backend
      const submissionData = {
        vehicleId: formData.vehicleId,
        scheduledDate: formData.scheduledDate,
        maintenanceType: formData.maintenanceType,
        description: formData.description,
        cost: parseFloat(formData.estimatedCost) || 0, // Map estimatedCost to cost for the backend
        technicianId: formData.assignedTechnicianId || null // Map assignedTechnicianId to technicianId for the backend
      };
      
      console.log('Submitting data to backend:', submissionData);
      
      let response;
      
      if (modalMode === 'create') {
        response = await api.post(
          '/maintenance',
          submissionData,
          { withCredentials: true }
        );
        
        if (response.data.success) {
          toast.success('Maintenance record created successfully');
          fetchMaintenanceRecords(); // Refresh the list
          handleCloseModal();
        }
      } else if (modalMode === 'edit' && selectedMaintenance) {
        response = await api.put(
          `/maintenance/${selectedMaintenance._id}`,
          submissionData,
          { withCredentials: true }
        );
        
        if (response.data.success) {
          toast.success('Maintenance record updated successfully');
          fetchMaintenanceRecords(); // Refresh the list
          handleCloseModal();
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Error submitting maintenance record';
      toast.error(errorMessage);
      // Optionally log more details for debugging
      if (error.response?.data) {
        console.log('Server response:', error.response.data);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this maintenance record? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true); // Show loading state
      
      const response = await api.delete(
        `/maintenance/${id}`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        toast.success('Maintenance record deleted successfully');
        
        // Remove the record from the list
        setMaintenanceRecords(prevRecords => 
          prevRecords.filter(record => record._id !== id)
        );
      } else {
        toast.error(response.data.message || 'Failed to delete maintenance record');
      }
    } catch (error) {
      console.error('Error deleting maintenance record:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Error deleting maintenance record';
      toast.error(errorMessage);
      
      // Optionally log more details for debugging
      if (error.response?.data) {
        console.log('Server response:', error.response.data);
      }
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterVehicle !== 'all') params.append('vehicleId', filterVehicle);
      if (filterTechnician !== 'all') params.append('technicianId', filterTechnician);
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      
      const response = await api.get(
        `/maintenance?${params.toString()}`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setMaintenanceRecords(response.data.data || []);
      } else {
        toast.error('Failed to search maintenance records');
      }
    } catch (error) {
      console.error('Error searching maintenance records:', error);
      toast.error(error.response?.data?.message || 'Error searching maintenance records');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilterStatus('all');
    setFilterVehicle('all');
    setFilterTechnician('all');
    setDateRange({
      startDate: '',
      endDate: ''
    });
    setSearchTerm('');
    fetchMaintenanceRecords();
  };
  
  // Function to view completed maintenance details
  const handleViewCompletedDetails = (record) => {
    console.log('Viewing completed maintenance details:', record);
    setSelectedMaintenance(record);
    setModalMode('viewCompleted');
    setShowModal(true);
  };

  // Filter records based on search term
  const filteredRecords = maintenanceRecords.filter(record => {
    return (
      record.vehicleId?.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.vehicleId?.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.vehicleId?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.vehicle?.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.vehicle?.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.vehicle?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.maintenanceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Loading state
  if (loading && maintenanceRecords.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
          <FaTools className="inline-block mr-2" />
          Maintenance Management
        </h1>
        
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setLoading(true);
              fetchMaintenanceRecords();
              fetchVehicles();
              fetchTechnicians();
              toast.success('Data refreshed');
            }}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          
          <button
            onClick={() => handleOpenModal('create')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="mr-2" />
            Schedule New Maintenance
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Search & Filter</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Term
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle
              </label>
              <select
                value={filterVehicle}
                onChange={(e) => setFilterVehicle(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Vehicles</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.make} {vehicle.model} ({vehicle.registrationNumber})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Technician
              </label>
              <select
                value={filterTechnician}
                onChange={(e) => setFilterTechnician(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Technicians</option>
                {technicians.map(technician => (
                  <option key={technician._id} value={technician._id}>
                    {technician.userId.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <button
              onClick={resetFilters}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Reset Filters
            </button>
            
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Maintenance Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Technician
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No maintenance records found
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                          <FaCar />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {record.vehicleId?.make || record.vehicle?.make} {record.vehicleId?.model || record.vehicle?.model}
                          </div>
                          <div className="text-xs text-gray-500">
                            {record.vehicleId?.registrationNumber || record.vehicle?.registrationNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {record.maintenanceType}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-1">
                        {record.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaCalendarAlt className="text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {format(new Date(record.scheduledDate), 'MMM dd, yyyy')}
                        </div>
                      </div>
                      {record.completionDate && (
                        <div className="text-xs text-gray-500">
                          Completed: {format(new Date(record.completionDate), 'MMM dd, yyyy')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.technicianId ? (
                        <div className="flex items-center">
                          <FaUser className="text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            {record.technicianId.userId?.name || 'Unknown'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}
                      >
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Est: Rs {record.cost?.toFixed(2) || record.estimatedCost?.toFixed(2) || '0.00'}
                      </div>
                      {record.actualCost && (
                        <div className="text-xs text-gray-500">
                          Actual: Rs {record.actualCost.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {record.status === 'completed' ? (
                          <button
                            onClick={() => handleViewCompletedDetails(record)}
                            className="text-green-600 hover:text-green-900"
                            title="View Completed Maintenance Details"
                          >
                            <FaEye className="h-5 w-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenModal('edit', record)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit Maintenance"
                          >
                            <FaEdit className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(record._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Maintenance Record"
                        >
                          <FaTrash className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity" 
              onClick={handleCloseModal}
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div 
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-50 pointer-events-auto"
              onClick={(e) => {
                e.stopPropagation(); // Prevent clicks inside from closing the modal
                console.log('Modal content clicked');
              }}
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {modalMode === 'create' ? 'Schedule New Maintenance' : 'Edit Maintenance Record'}
                    </h3>
                    
                    <form 
                      onSubmit={handleSubmit} 
                      className="mt-4"
                      method="post" 
                      action="#"
                    >
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vehicle
                          </label>
                          <select
                            name="vehicleId"
                            value={formData.vehicleId}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">Select a Vehicle</option>
                            {vehicles.map(vehicle => (
                              <option key={vehicle._id} value={vehicle._id}>
                                {vehicle.make} {vehicle.model} ({vehicle.registrationNumber})
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Maintenance Type
                          </label>
                          <select
                            name="maintenanceType"
                            value={formData.maintenanceType}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            required
                          >
                            <option value="">Select Type</option>
                            <option value="Regular Service">Regular Service</option>
                            <option value="Repair">Repair</option>
                            <option value="Inspection">Inspection</option>
                            <option value="Tire Change">Tire Change</option>
                            <option value="Oil Change">Oil Change</option>
                            <option value="Major Overhaul">Major Overhaul</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Scheduled Date
                          </label>
                          <input
                            type="date"
                            name="scheduledDate"
                            value={formData.scheduledDate}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe the maintenance needed"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estimated Cost (Rs)
                          </label>
                          <input
                            type="number"
                            name="estimatedCost"
                            value={formData.estimatedCost}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Assign Technician (Optional)
                          </label>
                          <select
                            name="assignedTechnicianId"
                            value={formData.assignedTechnicianId}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select a Technician</option>
                            {technicians.map(technician => (
                              <option key={technician._id} value={technician._id}>
                                {technician.userId?.name} - {technician.specialization || ''}
                              </option>
                            ))}
                          </select>
                          <p className="mt-1 text-xs text-gray-500">
                            Note: Only available technicians are shown. You can assign a technician later.
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer"
                          onClick={(e) => {
                            console.log('Submit button clicked');
                            // Force submit handling here to ensure it works
                            e.preventDefault();
                            handleSubmit(e);
                          }}
                        >
                          {modalMode === 'create' ? 'Schedule' : 'Update'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCloseModal}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal for Viewing Completed Maintenance Details */}
      {showModal && modalMode === 'viewCompleted' && selectedMaintenance && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity" 
              onClick={handleCloseModal}
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div 
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full relative z-50 pointer-events-auto"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600 sm:mx-0 sm:h-10 sm:w-10">
                    <FaCheckCircle className="h-6 w-6" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                      Completed Maintenance Record
                      <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Completed
                      </span>
                    </h3>
                    
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Vehicle Information</h4>
                          <p className="text-sm">
                            <span className="font-medium">Make/Model:</span>{' '}
                            {selectedMaintenance.vehicleId?.make || selectedMaintenance.vehicle?.make} {selectedMaintenance.vehicleId?.model || selectedMaintenance.vehicle?.model}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Registration:</span>{' '}
                            {selectedMaintenance.vehicleId?.registrationNumber || selectedMaintenance.vehicle?.registrationNumber}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Year:</span>{' '}
                            {selectedMaintenance.vehicleId?.year || selectedMaintenance.vehicle?.year}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Technician Information</h4>
                          {selectedMaintenance.technicianId ? (
                            <>
                              <p className="text-sm">
                                <span className="font-medium">Name:</span>{' '}
                                {selectedMaintenance.technicianId.userId?.name || 'Unknown'}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Specialization:</span>{' '}
                                {selectedMaintenance.technicianId.specialization || 'General'}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Experience:</span>{' '}
                                {selectedMaintenance.technicianId.experience || 0} years
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-gray-500">No technician assigned</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Maintenance Details</h4>
                        <p className="text-sm">
                          <span className="font-medium">Type:</span>{' '}
                          {selectedMaintenance.maintenanceType}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Description:</span>{' '}
                          {selectedMaintenance.description}
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm">
                              <span className="font-medium">Scheduled Date:</span>{' '}
                              {selectedMaintenance.scheduledDate 
                                ? format(new Date(selectedMaintenance.scheduledDate), 'MMMM dd, yyyy')
                                : 'Not scheduled'
                              }
                            </p>
                          </div>
                          <div>
                            <p className="text-sm">
                              <span className="font-medium">Completion Date:</span>{' '}
                              {selectedMaintenance.completionDate 
                                ? format(new Date(selectedMaintenance.completionDate), 'MMMM dd, yyyy')
                                : 'Not completed'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Cost Breakdown</h4>
                        <div className="bg-white p-3 rounded border border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <p className="text-xs text-gray-500">Parts Cost</p>
                            <p className="font-medium">Rs {selectedMaintenance.partsCost ? selectedMaintenance.partsCost.toFixed(2) : '0.00'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Labor Cost</p>
                            <p className="font-medium">Rs {selectedMaintenance.laborCost ? selectedMaintenance.laborCost.toFixed(2) : '0.00'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Additional Costs</p>
                            <p className="font-medium">Rs {selectedMaintenance.additionalCosts ? selectedMaintenance.additionalCosts.toFixed(2) : '0.00'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Total Cost</p>
                            <p className="font-medium text-lg text-green-600">Rs {selectedMaintenance.actualCost ? selectedMaintenance.actualCost.toFixed(2) : '0.00'}</p>
                          </div>
                        </div>
                      </div>
                      
                      {(selectedMaintenance.notes || selectedMaintenance.reportText) && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes & Report</h4>
                          
                          {selectedMaintenance.notes && (
                            <div className="mb-2">
                              <p className="text-xs font-medium text-gray-500 mb-1">Notes:</p>
                              <p className="text-sm bg-white p-2 rounded border border-gray-200">{selectedMaintenance.notes}</p>
                            </div>
                          )}
                          
                          {selectedMaintenance.reportText && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">Detailed Report:</p>
                              <p className="text-sm bg-white p-2 rounded border border-gray-200 whitespace-pre-line">{selectedMaintenance.reportText}</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            <FaReceipt className="mr-1" /> Bills & Receipts
                          </h4>
                          {selectedMaintenance.billFiles && selectedMaintenance.billFiles.length > 0 ? (
                            <ul className="bg-white p-2 rounded border border-gray-200 text-sm">
                              {selectedMaintenance.billFiles.map((file, index) => (
                                <li key={index} className="py-1 border-b last:border-b-0 border-gray-100 flex items-center">
                                  <a
                                    href={`/api/uploads/${file}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 hover:text-blue-800 flex items-center"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    {file}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500 bg-white p-2 rounded border border-gray-200">No bills or receipts uploaded</p>
                          )}
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            <FaFileAlt className="mr-1" /> Report Documents
                          </h4>
                          {selectedMaintenance.reportFiles && selectedMaintenance.reportFiles.length > 0 ? (
                            <ul className="bg-white p-2 rounded border border-gray-200 text-sm">
                              {selectedMaintenance.reportFiles.map((file, index) => (
                                <li key={index} className="py-1 border-b last:border-b-0 border-gray-100 flex items-center">
                                  <a
                                    href={`/api/uploads/${file}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 hover:text-blue-800 flex items-center"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    {file}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500 bg-white p-2 rounded border border-gray-200">No report documents uploaded</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMaintenanceManagement;
