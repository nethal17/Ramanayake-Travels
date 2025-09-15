import { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaCarCrash, FaCommentAlt, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaSearch } from 'react-icons/fa';
import { format } from 'date-fns';
import api from '../api/axios';
import toast from 'react-hot-toast';

const DriverInquiriesList = ({ refreshTrigger }) => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  useEffect(() => {
    fetchInquiries();
  }, [refreshTrigger]);
  
  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const response = await api.get('/inquiries/driver', { withCredentials: true });
      if (response.data.success) {
        setInquiries(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewDetails = (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowDetailsModal(true);
  };
  
  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedInquiry(null);
  };
  
  const getTypeIcon = (type) => {
    switch (type) {
      case 'breakdown':
        return <FaCarCrash className="text-red-500" />;
      case 'complaint':
        return <FaCommentAlt className="text-yellow-500" />;
      case 'other':
        return <FaExclamationTriangle className="text-blue-500" />;
      default:
        return <FaExclamationTriangle className="text-blue-500" />;
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-green-100 text-green-800';
      case 'high':
        return 'bg-yellow-100 text-yellow-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const filteredInquiries = inquiries.filter(inquiry => {
    // Apply text search
    const searchMatch = 
      inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inquiry.location && inquiry.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Apply type filter
    const typeMatch = filterType === 'all' || inquiry.type === filterType;
    
    // Apply status filter
    const statusMatch = filterStatus === 'all' || inquiry.status === filterStatus;
    
    return searchMatch && typeMatch && statusMatch;
  });
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FaExclamationTriangle className="mr-2 text-yellow-500" />
        My Inquiries
      </h2>
      
      {/* Search and Filter Controls */}
      <div className="mb-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2">
          {/* Search */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search inquiries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="py-2 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="breakdown">Breakdown</option>
            <option value="complaint">Complaint</option>
            <option value="other">Other</option>
          </select>
          
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-2 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>
      
      {/* Inquiries List */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {inquiries.length === 0 ? (
            <p>You haven't submitted any inquiries yet.</p>
          ) : (
            <p>No inquiries match your search criteria.</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((inquiry) => (
            <div 
              key={inquiry._id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewDetails(inquiry)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    {getTypeIcon(inquiry.type)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{inquiry.subject}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{inquiry.description}</p>
                    
                    {inquiry.location && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center">
                        <FaMapMarkerAlt className="mr-1" />
                        {inquiry.location}
                      </p>
                    )}
                    
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(inquiry.status)}`}>
                        {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                      </span>
                      
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(inquiry.priority)}`}>
                        {inquiry.priority.charAt(0).toUpperCase() + inquiry.priority.slice(1)} Priority
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 flex flex-col items-end">
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-1" />
                    {format(new Date(inquiry.createdAt), 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center mt-1">
                    <FaClock className="mr-1" />
                    {format(new Date(inquiry.createdAt), 'hh:mm a')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Details Modal */}
      {showDetailsModal && selectedInquiry && (
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
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 sm:mx-0 sm:h-10 sm:w-10">
                    {getTypeIcon(selectedInquiry.type)}
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center justify-between">
                      {selectedInquiry.subject}
                      <span className={`ml-2 text-xs px-2 py-1 rounded-full ${getStatusColor(selectedInquiry.status)}`}>
                        {selectedInquiry.status.charAt(0).toUpperCase() + selectedInquiry.status.slice(1)}
                      </span>
                    </h3>
                    
                    <div className="mt-4 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Description</h4>
                        <p className="mt-1 text-sm text-gray-500 whitespace-pre-line">{selectedInquiry.description}</p>
                      </div>
                      
                      {selectedInquiry.location && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Location</h4>
                          <p className="mt-1 text-sm text-gray-500 flex items-center">
                            <FaMapMarkerAlt className="mr-1 text-gray-400" />
                            {selectedInquiry.location}
                          </p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Type</h4>
                          <p className="mt-1 text-sm text-gray-500 flex items-center">
                            {getTypeIcon(selectedInquiry.type)}
                            <span className="ml-1 capitalize">{selectedInquiry.type}</span>
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Priority</h4>
                          <p className="mt-1 text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(selectedInquiry.priority)}`}>
                              {selectedInquiry.priority.charAt(0).toUpperCase() + selectedInquiry.priority.slice(1)}
                            </span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Submitted On</h4>
                          <p className="mt-1 text-sm text-gray-500">
                            {format(new Date(selectedInquiry.createdAt), 'MMM dd, yyyy hh:mm a')}
                          </p>
                        </div>
                        
                        {selectedInquiry.resolvedAt && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Resolved On</h4>
                            <p className="mt-1 text-sm text-gray-500">
                              {format(new Date(selectedInquiry.resolvedAt), 'MMM dd, yyyy hh:mm a')}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {selectedInquiry.adminResponse && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Admin Response</h4>
                          <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                            {selectedInquiry.adminResponse}
                          </div>
                        </div>
                      )}
                      
                      {selectedInquiry.images && selectedInquiry.images.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Attached Images</h4>
                          <div className="mt-2 grid grid-cols-3 gap-2">
                            {selectedInquiry.images.map((image, index) => (
                              <a 
                                key={index}
                                href={`/uploads/inquiries/${image}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <img 
                                  src={`/uploads/inquiries/${image}`} 
                                  alt={`Inquiry image ${index + 1}`}
                                  className="h-24 w-full object-cover rounded-md hover:opacity-80 transition-opacity"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedInquiry.vehicleId && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Related Vehicle</h4>
                          <p className="mt-1 text-sm text-gray-500">
                            {selectedInquiry.vehicleId.make} {selectedInquiry.vehicleId.model} ({selectedInquiry.vehicleId.registrationNumber})
                          </p>
                        </div>
                      )}
                      
                      {selectedInquiry.tripId && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Related Trip</h4>
                          <p className="mt-1 text-sm text-gray-500">
                            {selectedInquiry.tripId.pickupLocation} to {selectedInquiry.tripId.dropoffLocation} 
                            ({format(new Date(selectedInquiry.tripId.pickupDate), 'MMM dd, yyyy')})
                          </p>
                        </div>
                      )}
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

export default DriverInquiriesList;
