import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import { Tab } from '@headlessui/react';
import { FaUser, FaCar, FaCalendarAlt } from 'react-icons/fa';
import ReservationCard from "../components/ReservationCard";
import MyVehiclesSection from "../components/MyVehiclesSection";
import ChangePasswordDialog from "../components/ChangePasswordDialog";
import EditProfileDialog from "../components/EditProfileDialog";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState(null);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false);

  useEffect(() => {
    fetchUserReservations();
    // Set loading user to false after a short delay if no user data
    const timer = setTimeout(() => {
      setLoadingUser(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const fetchUserReservations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5001/api/reservations/user', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setReservations(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Failed to load your reservations');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 mt-10">My Profile</h1>
      
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-50 p-1 mb-8">
          <Tab className={({ selected }) =>
            `w-full py-2.5 text-sm font-medium leading-5 rounded-lg
             ${selected
              ? 'bg-white text-blue-700 shadow'
              : 'text-blue-600 hover:bg-white/[0.12] hover:text-blue-700'
            }`
          }>
            <div className="flex items-center justify-center">
              <FaUser className="mr-2" />
              <span>Profile Info</span>
            </div>
          </Tab>
          <Tab className={({ selected }) =>
            `w-full py-2.5 text-sm font-medium leading-5 rounded-lg
             ${selected
              ? 'bg-white text-blue-700 shadow'
              : 'text-blue-600 hover:bg-white/[0.12] hover:text-blue-700'
            }`
          }>
            <div className="flex items-center justify-center">
              <FaCalendarAlt className="mr-2" />
              <span>My Reservations</span>
            </div>
          </Tab>
          <Tab className={({ selected }) =>
            `w-full py-2.5 text-sm font-medium leading-5 rounded-lg
             ${selected
              ? 'bg-white text-blue-700 shadow'
              : 'text-blue-600 hover:bg-white/[0.12] hover:text-blue-700'
            }`
          }>
            <div className="flex items-center justify-center">
              <FaCar className="mr-2" />
              <span>My Vehicles</span>
            </div>
          </Tab>
        </Tab.List>
        
        <Tab.Panels>
          {/* Profile Info Panel */}
          <Tab.Panel className="rounded-xl bg-white p-6 border border-gray-200 shadow-md">
            <h2 className="text-2xl font-semibold mb-6">Account Information</h2>
            
            {loadingUser ? (
              <div className="animate-pulse space-y-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="bg-gray-200 rounded-full p-4 w-24 h-24"></div>
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-48"></div>
                    <div className="h-4 bg-gray-200 rounded w-40"></div>
                    <div className="h-4 bg-gray-200 rounded w-36"></div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div>
                    <div className="h-5 bg-gray-200 rounded w-40 mb-2"></div>
                    <div className="bg-gray-100 p-4 rounded-md space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                  <div>
                    <div className="h-5 bg-gray-200 rounded w-40 mb-2"></div>
                    <div className="bg-gray-100 p-4 rounded-md space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : user ? (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-200 bg-blue-100 flex items-center justify-center">
                    {user.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<span class="text-4xl font-bold text-blue-600">${user.name?.charAt(0) || user.email?.charAt(0) || 'U'}</span>`;
                        }}
                      />
                    ) : (
                      <span className="text-4xl font-bold text-blue-600">
                        {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold">{user.name || 'User'}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-gray-600">Member since: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div>
                    <h3 className="font-semibold mb-2">Contact Information</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>Phone:</strong> {user.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Account Details</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p><strong>Role:</strong> {user.role}</p>
                      <p><strong>Status:</strong> <span className="text-green-600">Active</span></p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-2 justify-end gap-4">
                  <button 
                    onClick={() => setShowEditProfileDialog(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
                  >
                    Edit Profile
                  </button>

                  <button 
                    onClick={() => setShowChangePasswordDialog(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No user information available. Please log in again.</p>
              </div>
            )}
          </Tab.Panel>
          
          {/* Reservations Panel */}
          <Tab.Panel className="rounded-xl bg-white p-6 border border-gray-200 shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">My Reservations</h2>
              <button 
                onClick={fetchUserReservations}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Refresh
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading your reservations...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p>{error}</p>
                <button 
                  onClick={fetchUserReservations} 
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            ) : reservations.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FaCalendarAlt className="text-4xl text-gray-400 mx-auto mb-3" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">No Reservations Yet</h3>
                <p className="text-gray-500 mb-4">You haven't made any vehicle reservations yet.</p>
                <a 
                  href="/fleet" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-block"
                >
                  Browse Vehicles
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {reservations.map((reservation, index) => (
                  <ReservationCard 
                    key={reservation._id} 
                    reservation={reservation} 
                    index={index}
                    onUpdate={(id, status) => {
                      setReservations(prevReservations => 
                        prevReservations.map(res => 
                          res._id === id ? { ...res, status } : res
                        )
                      );
                    }}
                  />
                ))}
              </div>
            )}
          </Tab.Panel>
          
          {/* Vehicles Panel */}
          <Tab.Panel className="rounded-xl bg-white p-6 border border-gray-200 shadow-md">
            <MyVehiclesSection />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* Change Password Dialog */}
      <ChangePasswordDialog 
        open={showChangePasswordDialog} 
        onClose={() => setShowChangePasswordDialog(false)} 
      />

      {/* Edit Profile Dialog */}
      <EditProfileDialog 
        open={showEditProfileDialog} 
        onClose={() => setShowEditProfileDialog(false)}
        onUpdateSuccess={() => {
          // Optionally refresh user data or handle success
          toast.success("Profile updated successfully!");
        }}
      />
    </div>
  );
}
