import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUser, FaUserShield, FaCar, FaTools, FaUserTie } from 'react-icons/fa';
import { RiDeleteBin6Line, RiEditLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

export default function AdminUserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5001/api/auth/allUsers', {
        withCredentials: true
      });
      setUsers(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin':
        return <FaUserShield className="text-red-500" />;
      case 'customer':
        return <FaUser className="text-blue-500" />;
      case 'driver':
        return <FaUserTie className="text-green-500" />;
      case 'vehicle_owner':
        return <FaCar className="text-purple-500" />;
      case 'technician':
        return <FaTools className="text-yellow-500" />;
      default:
        return <FaUser className="text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilter = (e) => {
    setSelectedRole(e.target.value);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      {/* Search and Filter */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="w-full md:w-64">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedRole}
            onChange={handleRoleFilter}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="customer">Customers</option>
            <option value="driver">Drivers</option>
            <option value="vehicle_owner">Vehicle Owners</option>
            <option value="technician">Technicians</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-10">
          <div className="spinner"></div>
          <p className="mt-3 text-gray-600">Loading users...</p>
        </div>
      ) : (
        <>
          {/* User Count Summary */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 flex items-center">
              <div className="rounded-full bg-gray-100 p-3 mr-4">
                <FaUser className="text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-xl font-bold">{users.length}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <FaUser className="text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Customers</p>
                <p className="text-xl font-bold">{users.filter(user => user.role === 'customer').length}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <FaUserTie className="text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Drivers</p>
                <p className="text-xl font-bold">{users.filter(user => user.role === 'driver').length}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 flex items-center">
              <div className="rounded-full bg-purple-100 p-3 mr-4">
                <FaCar className="text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Vehicle Owners</p>
                <p className="text-xl font-bold">{users.filter(user => user.role === 'vehicle_owner').length}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">
                <FaTools className="text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Technicians</p>
                <p className="text-xl font-bold">{users.filter(user => user.role === 'technician').length}</p>
              </div>
            </div>
          </div>
          
          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={user.profilePic || "https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg"}
                                alt={user.name}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getRoleIcon(user.role)}
                            <span className="ml-2 text-sm text-gray-600 capitalize">{user.role.replace('_', ' ')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isVerified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            title="Edit User"
                          >
                            <RiEditLine size={18} />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900"
                            title="Delete User"
                          >
                            <RiDeleteBin6Line size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        No users found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
