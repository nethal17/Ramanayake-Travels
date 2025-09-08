import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  RiUserAddLine, 
  RiUserLine, 
  RiMailLine, 
  RiPhoneLine,
  RiMapPinLine,
  RiCloseCircleLine,
  RiTimeLine,
  RiEyeLine,
  RiEditLine,
  RiDeleteBin6Line,
  RiRefreshLine,
  RiSearchLine,
} from 'react-icons/ri';
import { RxCheckCircled } from "react-icons/rx";
import { useAuth } from '../hooks/useAuth';
import UpdateDriverDialog from '../components/UpdateDriverDialog';

const DriverListPage = () => {
  const { getAuthHeaders } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/drivers/list', {
        headers: getAuthHeaders(),
      });
      const result = await response.json();
      
      if (result.success) {
        setDrivers(result.data);
      } else {
        toast.error('Failed to fetch drivers');
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast.error('Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleStatusUpdate = async (driverId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5001/api/drivers/${driverId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Driver status updated successfully');
        fetchDrivers(); // Refresh the list
      } else {
        toast.error(result.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (driverId) => {
    if (window.confirm('Are you sure you want to delete this driver? This action cannot be undone.')) {
      try {
        const response = await fetch(`http://localhost:5001/api/drivers/${driverId}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });

        const result = await response.json();
        
        if (result.success) {
          toast.success('Driver deleted successfully');
          fetchDrivers(); // Refresh the list
        } else {
          toast.error(result.message || 'Failed to delete driver');
        }
      } catch (error) {
        console.error('Error deleting driver:', error);
        toast.error('Failed to delete driver');
      }
    }
  };

  const handleUpdate = (driver) => {
    setSelectedDriver(driver);
    setUpdateDialogOpen(true);
  };

  const handleUpdateSuccess = () => {
    fetchDrivers(); // Refresh the list
    setUpdateDialogOpen(false);
    setSelectedDriver(null);
  };

  const handleCloseUpdateDialog = () => {
    setUpdateDialogOpen(false);
    setSelectedDriver(null);
  };

  const getStatusBadge = (status, isVerified) => {
    if (!isVerified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <RiTimeLine className="mr-1" size={12} />
          Pending Verification
        </span>
      );
    }

    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: RxCheckCircled },
      suspended: { color: 'bg-red-100 text-red-800', icon: RiCloseCircleLine }
    };

    const config = statusConfig[status] || statusConfig.active;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="mr-1" size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.userId?.phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'verified' && driver.userId?.isVerified) ||
                         (statusFilter === 'unverified' && !driver.userId?.isVerified) ||
                         driver.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading drivers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                <RiUserLine className="mr-2 sm:mr-3 text-blue-600" size={28} />
                Driver Management
              </h1>
              <p className="mt-2 text-gray-600 text-sm sm:text-base">Manage all drivers in the system</p>
            </div>
            <Link
              to="/admin/add-driver"
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center text-sm sm:text-base"
            >
              <RiUserAddLine className="mr-2" size={16} />
              <span className="hidden sm:inline">Add New Driver</span>
              <span className="sm:hidden">Add Driver</span>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search drivers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
              <button
                onClick={fetchDrivers}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center text-sm"
              >
                <RiRefreshLine className="mr-2" size={16} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          <div className="bg-white p-3 lg:p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <RiUserLine className="text-blue-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-xs lg:text-sm font-medium text-gray-600">Total Drivers</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">{drivers.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 lg:p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <RxCheckCircled className="text-green-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-xs lg:text-sm font-medium text-gray-600">Verified</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {drivers.filter(d => d.userId?.isVerified).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 lg:p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <RxCheckCircled className="text-green-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-xs lg:text-sm font-medium text-gray-600">Active</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {drivers.filter(d => d.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 lg:p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <RiTimeLine className="text-yellow-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-xs lg:text-sm font-medium text-gray-600">Pending</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {drivers.filter(d => !d.userId?.isVerified).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Drivers Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {filteredDrivers.length === 0 ? (
            <div className="text-center py-12">
              <RiUserLine className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No drivers found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Get started by adding a new driver.'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <div className="mt-6">
                  <Link
                    to="/admin/add-driver"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <RiUserAddLine className="mr-2" size={16} />
                    Add New Driver
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Driver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Age
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDrivers.map((driver) => (
                      <tr key={driver._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <RiUserLine className="text-blue-600" size={20} />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {driver.userId?.name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {driver._id.slice(-6)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <RiMailLine className="mr-1 text-gray-400" size={14} />
                            {driver.userId?.email || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <RiPhoneLine className="mr-1 text-gray-400" size={14} />
                            {driver.userId?.phone || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {driver.age} years
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(driver.status, driver.userId?.isVerified)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(driver.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-3">
                            {driver.userId?.isVerified && (
                              <select
                                value={driver.status}
                                onChange={(e) => handleStatusUpdate(driver._id, e.target.value)}
                                className="text-xs border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                              </select>
                            )}
                            <button
                              onClick={() => handleUpdate(driver)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Update driver details"
                            >
                              <RiEditLine size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(driver._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete driver"
                            >
                              <RiDeleteBin6Line size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4 p-4">
                {filteredDrivers.map((driver) => (
                  <div key={driver._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    {/* Driver Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <RiUserLine className="text-blue-600" size={20} />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-900">
                            {driver.userId?.name || 'N/A'}
                          </h3>
                          <p className="text-xs text-gray-500">ID: {driver._id.slice(-6)}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdate(driver)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                          title="Update driver"
                        >
                          <RiEditLine size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(driver._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                          title="Delete driver"
                        >
                          <RiDeleteBin6Line size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Driver Details */}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <RiMailLine className="mr-2 text-gray-400" size={14} />
                        <span className="truncate">{driver.userId?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <RiPhoneLine className="mr-2 text-gray-400" size={14} />
                        <span>{driver.userId?.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <RiMapPinLine className="mr-2 text-gray-400" size={14} />
                        <span>{driver.age} years old</span>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(driver.status, driver.userId?.isVerified)}
                        <span className="text-xs text-gray-500">
                          {new Date(driver.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {driver.userId?.isVerified && (
                        <select
                          value={driver.status}
                          onChange={(e) => handleStatusUpdate(driver._id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                        >
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Update Driver Dialog */}
      <UpdateDriverDialog
        isOpen={updateDialogOpen}
        onClose={handleCloseUpdateDialog}
        driver={selectedDriver}
        onUpdate={handleUpdateSuccess}
      />
    </div>
  );
};

export default DriverListPage;
