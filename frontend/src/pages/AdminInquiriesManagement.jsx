import { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaEye, FaReply, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { apiGet, apiPut, apiDelete } from '../utils/apiUtils';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminInquiriesManagement() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  
  useEffect(() => {
    fetchInquiries();
  }, []);
  
  const fetchInquiries = async () => {
    try {
      setLoading(true);
      
      // Build query parameters for filtering
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.type = typeFilter;
      
      console.log('Fetching inquiries with params:', params);
      const response = await apiGet('/inquiries/admin', params);
      
      if (response) {
        console.log('Fetched inquiries:', response.data);
        
        // Apply client-side filtering for search query and date range
        let filteredData = response.data || [];
        
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          filteredData = filteredData.filter(inquiry => {
            const subjectMatch = inquiry.subject?.toLowerCase().includes(searchLower);
            const descriptionMatch = inquiry.description?.toLowerCase().includes(searchLower);
            const driverNameMatch = inquiry.driverId?.name?.toLowerCase().includes(searchLower);
            return subjectMatch || descriptionMatch || driverNameMatch;
          });
        }
        
        if (dateRange.startDate) {
          filteredData = filteredData.filter(inquiry => 
            new Date(inquiry.createdAt) >= new Date(dateRange.startDate)
          );
        }
        
        if (dateRange.endDate) {
          filteredData = filteredData.filter(inquiry => 
            new Date(inquiry.createdAt) <= new Date(dateRange.endDate)
          );
        }
        
        setInquiries(filteredData);
      }
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      setError('Failed to load inquiries');
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async () => {
    // Call fetchInquiries with the current filter settings
    await fetchInquiries();
  };
  
  const resetFilters = async () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setSearchQuery('');
    setDateRange({ startDate: '', endDate: '' });
    await fetchInquiries();
  };
  
  const openModal = (inquiry) => {
    console.log('Opening modal for inquiry:', inquiry);
    // Check if inquiry has necessary data
    if (!inquiry || !inquiry._id) {
      console.error('Invalid inquiry data:', inquiry);
      toast.error('Cannot open details for this inquiry');
      return;
    }
    setSelectedInquiry(inquiry);
    setModalOpen(true);
  };
  
  const closeModal = () => {
    console.log('Closing detail modal');
    setModalOpen(false);
    setSelectedInquiry(null);
  };
  
  const openResponseModal = (inquiry) => {
    console.log('Opening response modal for inquiry:', inquiry);
    // Check if inquiry has necessary data
    if (!inquiry || !inquiry._id) {
      console.error('Invalid inquiry data for response:', inquiry);
      toast.error('Cannot respond to this inquiry');
      return;
    }
    setSelectedInquiry(inquiry);
    setResponse(inquiry.adminResponse || '');
    setResponseModalOpen(true);
  };
  
  const closeResponseModal = () => {
    setResponseModalOpen(false);
    setResponse('');
  };
  
  const handleSubmitResponse = async () => {
    if (!response.trim()) {
      toast.error('Response cannot be empty');
      return;
    }
    
    try {
      setSubmitting(true);
      console.log('Submitting response for inquiry:', selectedInquiry._id);
      console.log('Response content:', response);
      console.log('Status:', selectedInquiry.status);
      
      // Fix: Call the correct endpoint without /respond suffix and include the selected status
      const result = await apiPut(`/inquiries/${selectedInquiry._id}`, {
        adminResponse: response,
        status: selectedInquiry.status || 'responded'
      });
      
      console.log('Response submission result:', result);
      
      if (result.success) {
        toast.success('Response submitted successfully');
        closeResponseModal();
        // Update the inquiry in the list
        setInquiries(prev => 
          prev.map(item => 
            item._id === selectedInquiry._id 
              ? { 
                  ...item, 
                  adminResponse: response, 
                  status: selectedInquiry.status || 'responded' 
                } 
              : item
          )
        );
        // Refresh the inquiries list to get the updated data
        fetchInquiries();
      }
    } catch (err) {
      console.error('Error submitting response:', err);
      toast.error('Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDeleteInquiry = async (id) => {
    console.log('Attempting to delete inquiry with ID:', id);
    if (!id) {
      console.error('Invalid inquiry ID for deletion');
      toast.error('Cannot delete this inquiry');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    
    try {
      const result = await apiDelete(`/inquiries/${id}`);
      console.log('Delete inquiry result:', result);
      
      if (result.success) {
        toast.success('Inquiry deleted successfully');
        setInquiries(prev => prev.filter(item => item._id !== id));
        if (modalOpen) closeModal();
      }
    } catch (err) {
      console.error('Error deleting inquiry:', err);
      toast.error('Failed to delete inquiry');
    }
  };
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'responded':
        return 'bg-green-100 text-green-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Driver Inquiries Management</h1>
        <button
          onClick={fetchInquiries}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Refresh
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="responded">Responded</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="breakdown">Breakdown</option>
              <option value="complaint">Complaint</option>
              <option value="maintenance">Maintenance</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by subject, description or driver"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-10 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={resetFilters}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Reset
          </button>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
          >
            <FaFilter className="mr-1" /> Filter
          </button>
        </div>
      </div>
      
      {/* Inquiries List */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-gray-500">Loading inquiries...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-700 mb-4">
          <p className="font-medium">Error loading inquiries</p>
          <p>{error}</p>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <FaExclamationTriangle className="mx-auto text-yellow-500 text-4xl mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No inquiries found</h3>
          <p className="text-gray-500">There are no inquiries matching your filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inquiries.map((inquiry) => (
                  <tr 
                    key={inquiry._id} 
                    className="hover:bg-gray-50 cursor-pointer" 
                    onClick={() => openModal(inquiry)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {inquiry._id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inquiry.driverId?.userId?.name || 'Unknown Driver'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inquiry.type ? inquiry.type.charAt(0).toUpperCase() + inquiry.type.slice(1) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inquiry.subject || 'No Subject'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(inquiry.status)}`}>
                        {inquiry.status ? inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1) : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeClass(inquiry.priority)}`}>
                        {inquiry.priority ? inquiry.priority.charAt(0).toUpperCase() + inquiry.priority.slice(1) : 'Normal'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inquiry.createdAt ? formatDate(inquiry.createdAt) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openModal(inquiry);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openResponseModal(inquiry);
                        }}
                        className="text-green-600 hover:text-green-900 mr-3"
                        title="Respond"
                      >
                        <FaReply />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteInquiry(inquiry._id);
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Detail Modal */}
      {modalOpen && selectedInquiry && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          {console.log('Rendering modal with inquiry:', selectedInquiry)}
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <div 
              className="fixed inset-0 transition-opacity" 
              aria-hidden="true" 
              onClick={closeModal}
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div 
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Inquiry Details
                    </h3>
                    
                    <div className="border-b border-gray-200 pb-4 mb-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Driver</p>
                          <p>{selectedInquiry.driverId?.userId?.name || 'Unknown Driver'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Contact</p>
                          <p>{selectedInquiry.driverId?.userId?.phone || selectedInquiry.driverId?.userId?.email || 'No contact information'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Type</p>
                          <p>{selectedInquiry.type ? selectedInquiry.type.charAt(0).toUpperCase() + selectedInquiry.type.slice(1) : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Status</p>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedInquiry.status)}`}>
                            {selectedInquiry.status ? selectedInquiry.status.charAt(0).toUpperCase() + selectedInquiry.status.slice(1) : 'Pending'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Priority</p>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeClass(selectedInquiry.priority)}`}>
                            {selectedInquiry.priority ? selectedInquiry.priority.charAt(0).toUpperCase() + selectedInquiry.priority.slice(1) : 'Normal'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Submitted On</p>
                          <p>{selectedInquiry.createdAt ? formatDate(selectedInquiry.createdAt) : 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Subject</h4>
                      <p className="text-gray-700">{selectedInquiry.subject || 'No Subject'}</p>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-700 whitespace-pre-line">{selectedInquiry.description || 'No Description'}</p>
                    </div>
                    
                    {selectedInquiry.vehicleId && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Related Vehicle</h4>
                        <p className="text-gray-700">{selectedInquiry.vehicleId.make} {selectedInquiry.vehicleId.model} ({selectedInquiry.vehicleId.registrationNumber})</p>
                      </div>
                    )}
                    
                    {selectedInquiry.images && selectedInquiry.images.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Attached Images</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedInquiry.images.map((image, index) => (
                            <a 
                              key={index} 
                              href={`http://localhost:5001/uploads/inquiries/${image}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="block"
                            >
                              <img 
                                src={`http://localhost:5001/uploads/inquiries/${image}`} 
                                alt={`Inquiry attachment ${index + 1}`} 
                                className="h-32 w-full object-cover rounded-md border border-gray-200"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedInquiry.adminResponse && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-md">
                        <h4 className="font-medium text-gray-900 mb-2">Admin Response</h4>
                        <p className="text-gray-700 whitespace-pre-line">{selectedInquiry.adminResponse}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6">
                {/* Status and Priority Controls */}
                <div className="flex flex-wrap items-center justify-between mb-4">
                  <div className="flex items-center mb-2 sm:mb-0">
                    <span className="mr-2 text-sm font-medium">Status:</span>
                    <div className="relative">
                      <select
                        value={selectedInquiry.status || 'pending'}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          // Add debugger to see if this function is called
                          console.log("Status select onChange triggered with value:", newStatus);
                          try {
                            console.log(`Updating inquiry ${selectedInquiry._id} status to ${newStatus}`);
                            const result = await apiPut(`/inquiries/${selectedInquiry._id}`, {
                              status: newStatus
                            });
                            
                            if (result.success) {
                              toast.success(`Status updated to ${newStatus}`);
                              // Update the inquiry in state
                              setSelectedInquiry({...selectedInquiry, status: newStatus});
                              // Update the inquiry in the list
                              setInquiries(prev => 
                                prev.map(item => 
                                  item._id === selectedInquiry._id 
                                    ? {...item, status: newStatus} 
                                    : item
                                )
                              );
                            }
                          } catch (err) {
                            console.error('Error updating status:', err);
                            toast.error('Failed to update status');
                          }
                        }}
                        style={{color: '#000', opacity: 1, appearance: 'none'}}
                        className="ml-2 pr-8 pl-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 font-medium cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="responded">Responded</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-2 sm:mb-0">
                    <span className="mr-2 text-sm font-medium">Priority:</span>
                    <div className="relative">
                      <select
                        value={selectedInquiry.priority || 'medium'}
                        onChange={async (e) => {
                          const newPriority = e.target.value;
                          // Add debugger to see if this function is called
                          console.log("Priority select onChange triggered with value:", newPriority);
                          try {
                            console.log(`Updating inquiry ${selectedInquiry._id} priority to ${newPriority}`);
                            const result = await apiPut(`/inquiries/${selectedInquiry._id}`, {
                              priority: newPriority
                            });
                            
                            if (result.success) {
                              toast.success(`Priority updated to ${newPriority}`);
                              // Update the inquiry in state
                              setSelectedInquiry({...selectedInquiry, priority: newPriority});
                              // Update the inquiry in the list
                              setInquiries(prev => 
                                prev.map(item => 
                                  item._id === selectedInquiry._id 
                                    ? {...item, priority: newPriority} 
                                    : item
                                )
                              );
                            }
                          } catch (err) {
                            console.error('Error updating priority:', err);
                            toast.error('Failed to update priority');
                          }
                        }}
                        style={{color: '#000', opacity: 1, appearance: 'none'}}
                        className="ml-2 pr-8 pl-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 font-medium cursor-pointer"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      closeModal();
                      openResponseModal(selectedInquiry);
                    }}
                    className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Respond
                  </button>
                  
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Response Modal */}
      {responseModalOpen && selectedInquiry && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <div 
              className="fixed inset-0 transition-opacity" 
              aria-hidden="true"
              onClick={closeResponseModal}
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div 
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Respond to Inquiry
                    </h3>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Inquiry from</p>
                      <p className="font-medium">{selectedInquiry.driverId?.userId?.name || 'Unknown Driver'}</p>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Subject</p>
                      <p>{selectedInquiry.subject || 'No Subject'}</p>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Response
                      </label>
                      <textarea
                        id="response"
                        name="response"
                        rows="6"
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Write your response here..."
                      ></textarea>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="responseStatus" className="block text-sm font-medium text-gray-700 mb-1">
                        Update Status
                      </label>
                      <div className="relative">
                        <select
                          id="responseStatus"
                          name="responseStatus"
                          value={selectedInquiry.status || 'responded'}
                          onChange={(e) => {
                            console.log("Response modal status onChange triggered with value:", e.target.value);
                            setSelectedInquiry({...selectedInquiry, status: e.target.value});
                          }}
                          style={{color: '#000', opacity: 1, appearance: 'none'}}
                          className="block w-full pr-8 pl-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 font-medium cursor-pointer"
                        >
                          <option value="responded">Responded</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSubmitResponse}
                  disabled={submitting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Response'}
                </button>
                <button
                  type="button"
                  onClick={closeResponseModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
