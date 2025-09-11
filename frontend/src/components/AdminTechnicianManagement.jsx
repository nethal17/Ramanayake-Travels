import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FaTools, FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaStar } from 'react-icons/fa';
import { format } from 'date-fns';

const AdminTechnicianManagement = () => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    address: '',
    specialization: '',
    experience: '',
    certName: '',
    certIssueDate: '',
    certExpiryDate: '',
    certificateImage: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch technicians on component mount
  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      const response = await api.get('/technicians', {
        withCredentials: true
      });

      if (response.data.success) {
        setTechnicians(response.data.data || []);
      } else {
        toast.error('Failed to load technicians');
      }
    } catch (error) {
      console.error('Error fetching technicians:', error);
      toast.error(error.response?.data?.message || 'Error loading technicians');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, technician = null) => {
    setModalMode(mode);
    setSelectedTechnician(technician);
    setImagePreview(null);

    if (mode === 'create') {
      // Reset form for create
      setFormData({
        name: '',
        email: '',
        phone: '',
        age: '',
        address: '',
        specialization: '',
        experience: '',
        certName: '',
        certIssueDate: '',
        certExpiryDate: '',
        certificateImage: null
      });
    } else if (mode === 'edit' && technician) {
      // Populate form for edit
      setFormData({
        name: technician.userId.name || '',
        email: technician.userId.email || '',
        phone: technician.userId.phone || '',
        age: technician.age || '',
        address: technician.address || '',
        specialization: technician.specialization || '',
        experience: technician.experience || '',
        certName: technician.certification?.certName || '',
        certIssueDate: technician.certification?.issueDate 
          ? format(new Date(technician.certification.issueDate), 'yyyy-MM-dd') 
          : '',
        certExpiryDate: technician.certification?.expiryDate 
          ? format(new Date(technician.certification.expiryDate), 'yyyy-MM-dd') 
          : '',
        certificateImage: null // Cannot pre-fill file input
      });
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'certificateImage' && files && files[0]) {
      setFormData({
        ...formData,
        [name]: files[0]
      });
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create FormData object for file upload
      const formDataObj = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'certificateImage' && formData[key]) {
          formDataObj.append(key, formData[key]);
        } else if (formData[key]) {
          formDataObj.append(key, formData[key]);
        }
      });
      
      let response;
      
      if (modalMode === 'create') {
        response = await api.post(
          '/technicians',
          formDataObj,
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        if (response.data.success) {
          toast.success('Technician created successfully');
          fetchTechnicians(); // Refresh the list
          handleCloseModal();
        }
      } else if (modalMode === 'edit' && selectedTechnician) {
        response = await api.put(
          `/technicians/${selectedTechnician._id}`,
          formDataObj,
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        if (response.data.success) {
          toast.success('Technician updated successfully');
          fetchTechnicians(); // Refresh the list
          handleCloseModal();
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.response?.data?.message || 'Error submitting form');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const response = await api.patch(
        `/technicians/status/${id}`,
        { status },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        toast.success(`Technician status updated to ${status}`);
        
        // Update the technician in the list
        setTechnicians(prevTechnicians => 
          prevTechnicians.map(technician => 
            technician._id === id ? response.data.data : technician
          )
        );
      } else {
        toast.error('Failed to update technician status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Error updating status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this technician? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await api.delete(
        `/technicians/${id}`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        toast.success('Technician deleted successfully');
        
        // Remove the technician from the list
        setTechnicians(prevTechnicians => 
          prevTechnicians.filter(technician => technician._id !== id)
        );
      } else {
        toast.error('Failed to delete technician');
      }
    } catch (error) {
      console.error('Error deleting technician:', error);
      toast.error(error.response?.data?.message || 'Error deleting technician');
    }
  };

  // Filter technicians based on search term and status
  const filteredTechnicians = technicians.filter(technician => {
    const matchesSearch = 
      technician.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      technician.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      technician.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && technician.availability) || 
      (filterStatus === 'inactive' && !technician.availability);
    
    return matchesSearch && matchesStatus;
  });

  // Loading state
  if (loading && technicians.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
          <FaTools className="inline-block mr-2" />
          Technician Management
        </h1>
        
        <button
          onClick={() => handleOpenModal('create')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <FaPlus className="mr-2" />
          Add New Technician
        </button>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <input
                type="text"
                placeholder="Search technicians..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center">
              <span className="mr-2 text-gray-700">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Technician
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTechnicians.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No technicians found
                  </td>
                </tr>
              ) : (
                filteredTechnicians.map((technician) => (
                  <tr key={technician._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                          <FaTools />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {technician.userId.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {technician._id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{technician.userId.email}</div>
                      <div className="text-sm text-gray-500">{technician.userId.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {technician.specialization}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {technician.experience} years
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{technician.certification?.certName}</div>
                      <div className="text-xs text-gray-500">
                        {technician.certification?.issueDate ? 
                          format(new Date(technician.certification.issueDate), 'MMM dd, yyyy') : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          technician.availability
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {technician.availability ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenModal('edit', technician)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FaEdit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(technician._id, !technician.availability)}
                          className={`${
                            technician.availability
                              ? 'text-red-600 hover:text-red-900'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {technician.availability ? (
                            <FaTimes className="h-5 w-5" />
                          ) : (
                            <FaCheck className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(technician._id)}
                          className="text-red-600 hover:text-red-900"
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
            <div className="fixed inset-0 transition-opacity" onClick={handleCloseModal}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {modalMode === 'create' ? 'Add New Technician' : 'Edit Technician'}
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone
                          </label>
                          <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Age
                          </label>
                          <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Specialization
                          </label>
                          <input
                            type="text"
                            name="specialization"
                            value={formData.specialization}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Experience (years)
                          </label>
                          <input
                            type="number"
                            name="experience"
                            value={formData.experience}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Certification Name
                          </label>
                          <input
                            type="text"
                            name="certName"
                            value={formData.certName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Issue Date
                          </label>
                          <input
                            type="date"
                            name="certIssueDate"
                            value={formData.certIssueDate}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expiry Date (optional)
                          </label>
                          <input
                            type="date"
                            name="certExpiryDate"
                            value={formData.certExpiryDate}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Certificate Image
                          </label>
                          <input
                            type="file"
                            name="certificateImage"
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            accept="image/*"
                            {...(modalMode === 'create' ? { required: true } : {})}
                          />
                          
                          {imagePreview && (
                            <div className="mt-2">
                              <img
                                src={imagePreview}
                                alt="Certificate Preview"
                                className="h-32 object-contain"
                              />
                            </div>
                          )}
                          
                          {modalMode === 'edit' && selectedTechnician?.certification?.certificateImage && !imagePreview && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500">Current certificate: {selectedTechnician.certification.certificateImage}</p>
                              <img
                                src={`/uploads/${selectedTechnician.certification.certificateImage}`}
                                alt="Current Certificate"
                                className="h-32 object-contain mt-1"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          {modalMode === 'create' ? 'Create' : 'Update'}
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
    </div>
  );
};

export default AdminTechnicianManagement;
