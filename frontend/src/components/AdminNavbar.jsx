import { lazy, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  RiDashboard3Line, 
  RiCarLine, 
  RiUserLine, 
  RiLogoutCircleLine, 
  RiMenu3Line, 
  RiCloseLine,
  RiArrowDownSLine,
  RiCarWashingLine,
  RiFileList3Line
} from 'react-icons/ri';
import { Avatar } from './Avatar';
import toast from 'react-hot-toast';

export const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [vehicleDropdownOpen, setVehicleDropdownOpen] = useState(false);
  const vehicleDropdownRef = useRef(null);
  const fallbackAvatar = "https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg";

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (vehicleDropdownRef.current && !vehicleDropdownRef.current.contains(event.target)) {
        setVehicleDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [vehicleDropdownRef]);

  const navItems = [
    { label: 'Dashboard', icon: RiDashboard3Line, path: '/admin/dashboard' },
    { label: 'Reservations', icon: RiCarLine, path: '/admin/reservations' },
    { 
      label: 'Vehicles', 
      icon: RiCarLine, 
      isDropdown: true,
      children: [
        { label: 'Vehicle List', icon: RiFileList3Line, path: '/admin/vehicles-list' },
        { label: 'Vehicle Applications', icon: RiFileList3Line, path: '/admin/vehicle-applications' },
        { label: 'Customer Vehicle', icon: RiCarWashingLine, path: '/admin/vehicle-register' },
        { label: 'Company Vehicle', icon: RiCarWashingLine, path: '/admin/company-vehicle-register' },
      ]
    },
    { label: 'Maintenance', icon: RiCarLine, path: '/admin/maintenance' },
    { label: 'Users', icon: RiUserLine, path: '/admin/users' },
  ];

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="fixed top-0 w-full bg-gray-900 text-white shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/admin/dashboard" className="flex items-center">
                <span className="text-xl font-bold">Ramanayake<span className="text-blue-400">Admin</span></span>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item, index) => (
                item.isDropdown ? (
                  <div ref={vehicleDropdownRef} className="relative" key={index}>
                    <button 
                      onClick={() => setVehicleDropdownOpen(!vehicleDropdownOpen)}
                      className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white"
                    >
                      <item.icon className="mr-2" />
                      {item.label}
                      <RiArrowDownSLine className={`ml-1 transform ${vehicleDropdownOpen ? 'rotate-180' : ''} transition-transform duration-200`} />
                    </button>
                    {vehicleDropdownOpen && (
                      <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1">
                          {item.children.map((child, childIndex) => (
                            <Link
                              key={childIndex}
                              to={child.path}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setVehicleDropdownOpen(false)}
                            >
                              <child.icon className="mr-2 text-gray-500" />
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link 
                    key={item.path}
                    to={item.path}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white"
                  >
                    <item.icon className="mr-2" />
                    {item.label}
                  </Link>
                )
              ))}
            </div>
            
            <div className="flex items-center">
              <div className="flex items-center ml-4">
                <div className="flex items-center space-x-3">
                  <span className="hidden md:inline-block">{user?.email}</span>
                  <Avatar 
                    src={user?.profilePic} 
                    fallbackSrc={fallbackAvatar}
                    className="h-8 w-8 rounded-full border-2 border-blue-500"
                  />
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-4 px-3 py-1 rounded text-sm bg-red-600 hover:bg-red-700 flex items-center"
                >
                  <RiLogoutCircleLine className="mr-1" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
              
              {/* Mobile menu button */}
              <button
                type="button"
                className="md:hidden ml-2 p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <RiCloseLine className="block h-6 w-6" />
                ) : (
                  <RiMenu3Line className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800">
            {navItems.map((item, index) => (
              item.isDropdown ? (
                <div key={index} className="space-y-1">
                  <button
                    onClick={() => setVehicleDropdownOpen(!vehicleDropdownOpen)}
                    className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700"
                  >
                    <item.icon className="mr-2" />
                    {item.label}
                    <RiArrowDownSLine className={`ml-auto transform ${vehicleDropdownOpen ? 'rotate-180' : ''} transition-transform duration-200`} />
                  </button>
                  
                  <div className={`pl-4 space-y-1 ${vehicleDropdownOpen ? 'block' : 'hidden'}`}>
                    {item.children.map((child, childIndex) => (
                      <Link
                        key={childIndex}
                        to={child.path}
                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <child.icon className="mr-2" />
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="mr-2" />
                  {item.label}
                </Link>
              )
            ))}
          </div>
        </div>
      </nav>

      {/* Spacer to push content below navbar */}
      <div className="h-16"></div>
    </>
  );
};
