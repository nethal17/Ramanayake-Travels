import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { FaTruck, FaTools, FaCheckCircle, FaSpinner, FaExclamationCircle } from 'react-icons/fa';
import { format } from 'date-fns';
import api from '../api/axios';

const TechnicianProfile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maintenanceTasks, setMaintenanceTasks] = useState([]);
  const [availabilityStatus, setAvailabilityStatus] = useState(false);
  
  // Debug current state values
  useEffect(() => {
    console.log('Current Profile Data State:', profileData);
    console.log('Current Availability Status:', availabilityStatus);
  }, [profileData, availabilityStatus]);
  
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedTask, setSelectedTask] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    notes: '',
    actualCost: '',
    partsCost: '',
    laborCost: '',
    additionalCosts: '',
    reportText: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState({
    billFiles: [],
    reportFiles: []
  });

  // Fetch technician profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await api.get('/technicians/profile/me');
        
        console.log('Profile API Response:', response.data);
        
        if (response.data.success) {
          setProfileData(response.data.data);
          setAvailabilityStatus(response.data.data.isAvailable || false);
        } else {
          toast.error('Failed to load profile data');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        console.log('Profile API Error:', error.response?.data || error.message);
        toast.error(error.response?.data?.message || 'Error loading profile');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfileData();
    }
  }, [user]);

  // Fetch maintenance tasks
  useEffect(() => {
    const fetchMaintenanceTasks = async () => {
      try {
        const response = await api.get('/maintenance/technician/assignments');
        
        console.log('Maintenance Tasks API Response:', response.data);
        
        if (response.data.success) {
          setMaintenanceTasks(response.data.data || []);
          console.log('Maintenance tasks set:', response.data.data);
        } else {
          toast.error('Failed to load maintenance tasks');
        }
      } catch (error) {
        console.error('Error fetching maintenance tasks:', error);
        console.log('Maintenance Tasks API Error:', error.response?.data || error.message);
        toast.error(error.response?.data?.message || 'Error loading tasks');
      }
    };

    if (user) {
      fetchMaintenanceTasks();
    }
  }, [user]);

  // Update availability status
  const updateAvailability = async (newStatus) => {
    try {
      if (!profileData || !profileData._id) {
        toast.error('Cannot update availability: profile data not loaded');
        return;
      }
      
      setLoading(true);
      const response = await api.patch(
        `/technicians/availability/${profileData._id}`,
        { isAvailable: newStatus }
      );
      
      console.log('Availability Update API Response:', response.data);
      
      if (response.data.success) {
        setAvailabilityStatus(newStatus);
        toast.success(`You are now ${newStatus ? 'available' : 'unavailable'} for maintenance tasks`);
      } else {
        toast.error('Failed to update availability');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      console.log('Availability Update API Error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Error updating availability');
    } finally {
      setLoading(false);
    }
  };

  // Handle task selection for viewing details
  const handleTaskSelect = (task) => {
    setSelectedTask(task);
    setStatusUpdate({
      status: task.status,
      notes: task.notes || '',
      actualCost: task.actualCost || '',
      partsCost: task.partsCost || '',
      laborCost: task.laborCost || '',
      additionalCosts: task.additionalCosts || '',
      reportText: task.reportText || ''
    });
    setUploadedFiles({
      billFiles: [],
      reportFiles: []
    });
  };

  // Handle task status update
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    
    if (!selectedTask) return;
    
    // Confirm before completing maintenance
    if (statusUpdate.status === 'completed') {
      if (!window.confirm(
        'Are you sure you want to mark this maintenance as completed? ' +
        'This will record the current date as the completion date and finalize the record. ' +
        'Please ensure all information and costs are accurate.'
      )) {
        return; // User cancelled
      }
    }
    
    try {
      const formData = new FormData();
      
      // Show loading toast for better UX
      const loadingToast = toast.loading(
        statusUpdate.status === 'completed' 
          ? 'Completing maintenance record...' 
          : 'Updating maintenance status...'
      );
      
      // Append all form data
      formData.append('status', statusUpdate.status);
      formData.append('notes', statusUpdate.notes);
      formData.append('actualCost', statusUpdate.actualCost);
      formData.append('partsCost', statusUpdate.partsCost);
      formData.append('laborCost', statusUpdate.laborCost);
      formData.append('additionalCosts', statusUpdate.additionalCosts);
      formData.append('reportText', statusUpdate.reportText);
      
      // Append all bill files
      uploadedFiles.billFiles.forEach(file => {
        formData.append('billFiles', file);
      });
      
      // Append all report files
      uploadedFiles.reportFiles.forEach(file => {
        formData.append('reportFiles', file);
      });
      
      console.log('Submitting maintenance update with status:', statusUpdate.status);
      
      const response = await api.patch(
        `/maintenance/technician/update/${selectedTask._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      console.log('Maintenance Update API Response:', response.data);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (response.data.success) {
        // Different success message based on status
        if (statusUpdate.status === 'completed') {
          toast.success('Maintenance has been marked as completed! 🎉');
        } else {
          toast.success('Maintenance status updated successfully');
        }
        
        // Update the task in the list
        setMaintenanceTasks(prevTasks => 
          prevTasks.map(task => 
            task._id === selectedTask._id ? response.data.data : task
          )
        );
        
        // Update selected task
        setSelectedTask(response.data.data);
        
        // Reset uploaded files
        setUploadedFiles({
          billFiles: [],
          reportFiles: []
        });
        
        // If completed, auto-switch to the completed tab
        if (statusUpdate.status === 'completed') {
          setActiveTab('completed');
        }
      } else {
        toast.error('Failed to update maintenance status');
      }
    } catch (error) {
      console.error('Error updating maintenance status:', error);
      console.log('Maintenance Update API Error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Error updating maintenance status');
    }
  };

  // Handle file upload
  const handleFileChange = (e, fileType) => {
    if (e.target.files.length > 0) {
      setUploadedFiles(prev => ({
        ...prev,
        [fileType]: [...prev[fileType], ...Array.from(e.target.files)]
      }));
    }
  };

  // Handle removing a file before uploading
  const handleRemoveFile = (fileType, index) => {
    setUploadedFiles(prev => ({
      ...prev,
      [fileType]: prev[fileType].filter((_, i) => i !== index)
    }));
  };

  // Handle removing an existing file
  const handleDeleteExistingFile = async (fileType, fileName) => {
    if (!selectedTask || !fileName) return;
    
    try {
      const response = await api.delete(
        `/maintenance/technician/file/${selectedTask._id}`,
        {
          data: { fileType: fileType === 'billFiles' ? 'bill' : 'report', fileName }
        }
      );
      
      console.log('File Deletion API Response:', response.data);
      
      if (response.data.success) {
        toast.success(`File deleted successfully`);
        
        // Update selected task with updated file list
        setSelectedTask(response.data.data);
        
        // Update the task in the list
        setMaintenanceTasks(prevTasks => 
          prevTasks.map(task => 
            task._id === selectedTask._id ? response.data.data : task
          )
        );
      } else {
        toast.error('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      console.log('File Deletion API Error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Error deleting file');
    }
  };

  // Filter tasks based on active tab
  const filteredTasks = maintenanceTasks.filter(task => {
    switch (activeTab) {
      case 'upcoming':
        return ['scheduled', 'pending', 'assigned'].includes(task.status);
      case 'inProgress':
        return task.status === 'in-progress';
      case 'completed':
        return task.status === 'completed';
      default:
        return true;
    }
  });

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:mr-6 mb-4 md:mb-0">
                <div className="h-24 w-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-4xl">
                  <FaTools />
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profileData?.userId?.name || 'Technician'}
                </h1>
                <p className="text-gray-600">{profileData?.userId?.email}</p>
                <p className="text-gray-600">{profileData?.userId?.phone}</p>
                <div className="mt-2">
                  <span className="text-sm font-medium mr-2">Specialization:</span>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {profileData?.specialization || 'General Maintenance'}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-sm font-medium mr-2">Experience:</span>
                  <span>{profileData?.experience || 0} years</span>
                </div>
                <div className="mt-2">
                  <span className="text-sm font-medium mr-2">Certification:</span>
                  <span>{profileData?.certification?.certName || 'Not specified'}</span>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="flex flex-col items-center">
                  <span className="text-sm font-medium mb-2">Availability Status</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={availabilityStatus}
                      onChange={() => updateAvailability(!availabilityStatus)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      {availabilityStatus ? 'Available' : 'Unavailable'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Dashboard */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'upcoming'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Upcoming ({maintenanceTasks.filter(t => ['scheduled', 'pending', 'assigned'].includes(t.status)).length})
              </button>
              <button
                onClick={() => setActiveTab('inProgress')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'inProgress'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                In Progress ({maintenanceTasks.filter(t => t.status === 'in-progress').length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'completed'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Completed ({maintenanceTasks.filter(t => t.status === 'completed').length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-10">
                <FaTools className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No maintenance tasks</h3>
                <p className="mt-1 text-sm text-gray-500">
                  There are no {activeTab} maintenance tasks assigned to you.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTasks.map((task) => (
                  <div
                    key={task._id}
                    onClick={() => handleTaskSelect(task)}
                    className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                      selectedTask?._id === task._id ? 'ring-2 ring-blue-500' : ''
                    } ${
                      task.status === 'completed' ? 'border-green-500 bg-green-50' : ''
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {task.vehicleId?.make} {task.vehicleId?.model}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {task.vehicleId?.registrationNumber}
                          </p>
                        </div>
                        <div>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full flex items-center ${
                              task.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : task.status === 'in-progress'
                                ? 'bg-yellow-100 text-yellow-800'
                                : task.status === 'assigned'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {task.status === 'completed' && <FaCheckCircle className="mr-1" />}
                            {task.status === 'in-progress' && <FaSpinner className="mr-1" />}
                            {task.status === 'assigned' && <FaTools className="mr-1" />}
                            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-900">
                          {task.maintenanceType}
                        </p>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {task.description}
                        </p>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        <div className="flex justify-between">
                          <span>Scheduled:</span>
                          <span>{task.scheduledDate ? format(new Date(task.scheduledDate), 'MMM dd, yyyy') : 'Not scheduled'}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span>Est. Cost:</span>
                          <span>RS {task.estimatedCost ? task.estimatedCost.toFixed(2) : (task.cost ? task.cost.toFixed(2) : '0.00')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Task Details & Update Form */}
        {selectedTask && (
          <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Maintenance Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Vehicle Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p>
                      <span className="font-medium">Make/Model:</span>{' '}
                      {selectedTask.vehicleId?.make} {selectedTask.vehicleId?.model}
                    </p>
                    <p>
                      <span className="font-medium">Registration:</span>{' '}
                      {selectedTask.vehicleId?.registrationNumber}
                    </p>
                    <p>
                      <span className="font-medium">Year:</span>{' '}
                      {selectedTask.vehicleId?.year}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Maintenance Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p>
                      <span className="font-medium">Type:</span>{' '}
                      {selectedTask.maintenanceType}
                    </p>
                    <p>
                      <span className="font-medium">Scheduled Date:</span>{' '}
                      {selectedTask.scheduledDate 
                        ? format(new Date(selectedTask.scheduledDate), 'MMMM dd, yyyy')
                        : 'Not scheduled'
                      }
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{' '}
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs flex items-center ${
                          selectedTask.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : selectedTask.status === 'in-progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : selectedTask.status === 'assigned'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {selectedTask.status === 'completed' && <FaCheckCircle className="mr-1" />}
                        {selectedTask.status === 'in-progress' && <FaSpinner className="mr-1" />}
                        {selectedTask.status === 'assigned' && <FaTools className="mr-1" />}
                        {selectedTask.status.charAt(0).toUpperCase() + selectedTask.status.slice(1)}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Description:</span>{' '}
                      {selectedTask.description}
                    </p>
                    {selectedTask.status === 'completed' && selectedTask.completionDate && (
                      <p>
                        <span className="font-medium">Completed On:</span>{' '}
                        {format(new Date(selectedTask.completionDate), 'MMMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Show cost details for completed tasks */}
              {selectedTask.status === 'completed' && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Maintenance Cost Breakdown
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Parts Cost</p>
                        <p className="font-medium">RS {selectedTask.partsCost ? selectedTask.partsCost.toFixed(2) : '0.00'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Labor Cost</p>
                        <p className="font-medium">RS {selectedTask.laborCost ? selectedTask.laborCost.toFixed(2) : '0.00'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Additional Costs</p>
                        <p className="font-medium">RS {selectedTask.additionalCosts ? selectedTask.additionalCosts.toFixed(2) : '0.00'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Cost</p>
                        <p className="font-medium text-lg">RS {selectedTask.actualCost ? selectedTask.actualCost.toFixed(2) : '0.00'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Show notes and report text for completed tasks */}
              {selectedTask.status === 'completed' && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Maintenance Notes & Report
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {selectedTask.notes && (
                      <div className="mb-4">
                        <p className="font-medium mb-1">Notes:</p>
                        <p className="text-gray-700">{selectedTask.notes}</p>
                      </div>
                    )}
                    {selectedTask.reportText && (
                      <div>
                        <p className="font-medium mb-1">Detailed Report:</p>
                        <p className="text-gray-700 whitespace-pre-line">{selectedTask.reportText}</p>
                      </div>
                    )}
                    {!selectedTask.notes && !selectedTask.reportText && (
                      <p className="text-gray-500 italic">No notes or report provided</p>
                    )}
                  </div>
                </div>
              )}

              {/* Show uploaded files for completed tasks */}
              {selectedTask.status === 'completed' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Bills & Receipts
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {selectedTask.billFiles && selectedTask.billFiles.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                          {selectedTask.billFiles.map((file, index) => (
                            <li key={index} className="py-2 flex items-center justify-between">
                              <a
                                href={`/api/uploads/${file}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-500 hover:text-blue-700 truncate flex items-center"
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
                        <p className="text-gray-500 italic">No bills or receipts uploaded</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Report Documents
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {selectedTask.reportFiles && selectedTask.reportFiles.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                          {selectedTask.reportFiles.map((file, index) => (
                            <li key={index} className="py-2 flex items-center justify-between">
                              <a
                                href={`/api/uploads/${file}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-500 hover:text-blue-700 truncate flex items-center"
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
                        <p className="text-gray-500 italic">No report documents uploaded</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Only show the update form if the task is not completed */}
              {selectedTask.status !== 'completed' && (
              <form onSubmit={handleStatusUpdate}>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Update Maintenance Status
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maintenance Status
                    </label>
                    <select
                      value={statusUpdate.status}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                      className={`w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 ${
                        statusUpdate.status === 'completed' 
                          ? 'bg-green-50 border-green-500 focus:border-green-500' 
                          : 'focus:border-blue-500'
                      }`}
                      required
                    >
                      <option value="assigned">Assigned</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    {statusUpdate.status === 'completed' && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm text-green-600 flex items-center">
                          <FaCheckCircle className="inline mr-2" /> 
                          Marking as complete will finalize this maintenance record
                        </p>
                        <p className="text-xs text-green-500 mt-1">
                          Please ensure all details and costs are correctly entered
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Actual Total Cost (RS)
                    </label>
                    <input
                      type="number"
                      value={statusUpdate.actualCost}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, actualCost: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parts Cost (RS)
                    </label>
                    <input
                      type="number"
                      value={statusUpdate.partsCost}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, partsCost: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Labor Cost (RS)
                    </label>
                    <input
                      type="number"
                      value={statusUpdate.laborCost}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, laborCost: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Costs (RS)
                    </label>
                    <input
                      type="number"
                      value={statusUpdate.additionalCosts}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, additionalCosts: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={statusUpdate.notes}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                    rows={3}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Add notes about the maintenance work..."
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maintenance Report
                  </label>
                  <textarea
                    value={statusUpdate.reportText}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, reportText: e.target.value })}
                    rows={5}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Detailed report of maintenance performed..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Bills/Receipts
                    </label>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, 'billFiles')}
                      multiple
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                    
                    {/* Files to be uploaded */}
                    {uploadedFiles.billFiles.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700 mb-1">Files to upload:</p>
                        <ul className="text-sm text-gray-500">
                          {uploadedFiles.billFiles.map((file, index) => (
                            <li key={index} className="flex items-center justify-between py-1">
                              <span className="truncate">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile('billFiles', index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Existing bill files */}
                    {selectedTask.billFiles && selectedTask.billFiles.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700 mb-1">Existing files:</p>
                        <ul className="text-sm text-gray-500">
                          {selectedTask.billFiles.map((file, index) => (
                            <li key={index} className="flex items-center justify-between py-1">
                              <a
                                href={`/api/uploads/${file}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-500 hover:text-blue-700 truncate"
                              >
                                {file}
                              </a>
                              <button
                                type="button"
                                onClick={() => handleDeleteExistingFile('billFiles', file)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Delete
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Report Documents
                    </label>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, 'reportFiles')}
                      multiple
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                    
                    {/* Files to be uploaded */}
                    {uploadedFiles.reportFiles.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700 mb-1">Files to upload:</p>
                        <ul className="text-sm text-gray-500">
                          {uploadedFiles.reportFiles.map((file, index) => (
                            <li key={index} className="flex items-center justify-between py-1">
                              <span className="truncate">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile('reportFiles', index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Existing report files */}
                    {selectedTask.reportFiles && selectedTask.reportFiles.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700 mb-1">Existing files:</p>
                        <ul className="text-sm text-gray-500">
                          {selectedTask.reportFiles.map((file, index) => (
                            <li key={index} className="flex items-center justify-between py-1">
                              <a
                                href={`/api/uploads/${file}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-500 hover:text-blue-700 truncate"
                              >
                                {file}
                              </a>
                              <button
                                type="button"
                                onClick={() => handleDeleteExistingFile('reportFiles', file)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Delete
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    className={`w-full md:w-auto ${
                      statusUpdate.status === 'completed' 
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white font-medium py-2 px-6 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  >
                    {statusUpdate.status === 'completed' 
                      ? 'Complete Maintenance' 
                      : 'Update Maintenance Record'}
                  </button>
                </div>
              </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicianProfile;
