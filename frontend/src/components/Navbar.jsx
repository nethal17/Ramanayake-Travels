import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { RiMenu3Line, RiCloseLine, RiUserLine, RiLogoutBoxLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { Avatar } from "./Avatar";
import { Dropdown } from "./Dropdown";
import { LoginDialog } from "./LoginDialog";
import { RegisterDialog } from "./RegisterDialog";
import { isDriver, isAdmin, isTechnician, getProfilePath } from "../utils/roleUtils";

export const Navbar = () => {
    const { isAuthenticated, logout, userId, user, userLoading, isAuthLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [openMenu, setOpenMenu] = useState(null); // 'user' | null
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [registerOpen, setRegisterOpen] = useState(false);
    const userDropdownRef = useRef(null);
    const sidebarRef = useRef(null);
    const fallbackAvatar = "https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg";
    
    const handleLogout = async () => {
        await logout();
        toast.success('Logged out');
        navigate('/');
    };

    useEffect(() => {
        // Close menus when clicking outside and close on Escape
        function handleClickOutside(event) {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target) && openMenu === 'user') {
                setOpenMenu(null);
            }
        }
        
        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                setOpenMenu(null);
                setSidebarOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [openMenu]);

    // Close UI on route change
    useEffect(() => {
        setOpenMenu(null);
        setSidebarOpen(false);
    }, [location.pathname]);

    return (
    <>
        {/* Main Navbar */}
        <nav className="fixed top-0 z-50 flex lg-hidden items-center justify-between w-full p-2 text-lg bg-gray-100 shadow-md font-normal">
            {/* Logo */}
            <div className="text-xl font-bold text-gray-900 pl-4">Ramanayake<span className="text-blue-500"> Travels</span></div>

            {/* Mobile Menu Button */}
            <button 
            id="menu-button"
            type="button"
            className="z-50 block lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            aria-expanded={sidebarOpen}
            aria-controls="mobile-sidebar"
            >
            {sidebarOpen ? (
                <RiCloseLine size={28} className="text-gray-900" />
            ) : (
                <RiMenu3Line size={28} className="text-gray-900" />
            )}
            </button>

            {/* Desktop Navigation Links */}
            <div className="items-center hidden lg:flex space-x-4 text-gray-900">
            <Link to="/" className="hover:text-blue-500">Home</Link>
            {isAuthenticated && (
              <Link to="/vehicle-registration" className="hover:text-blue-500">Register Vehicle</Link>
            )}
            <Link to="/fleet" className="hover:text-blue-500">Our Fleet</Link>
            <Link to="/contactus" className="hover:text-blue-500">Contact Us</Link>
            <Link to="/about-us" className="hover:text-blue-500">About Us</Link>
            </div>

            {/* Desktop Auth Buttons / User Profile */}
            <div className="hidden space-x-3 lg:flex">
            {isAuthenticated ? (
                                <div className="relative flex items-center pr-6" ref={userDropdownRef}>
                                    <div className="flex items-center gap-3 pr-6">
                                        <Dropdown
                                            isOpen={openMenu === 'user'}
                                            setIsOpen={(v) => setOpenMenu(v ? 'user' : null)}
                                            menuId="user-menu"
                                            align="right"
                                            button={
                                                <Avatar
                                                    src={user?.profilePic}
                                                    alt="Profile"
                                                    fallbackSrc={fallbackAvatar}
                                                    className="object-cover w-[40px] h-[40px] border-2 border-blue-500 rounded-full shadow-md hover:cursor-pointer"
                                                />
                                            }
                                        >
                                            <div className="p-2 min-w-[240px] max-w-[300px]">
                                                <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-200 mb-2 truncate">
                                                    {(isAuthLoading || userLoading) ? "Loading..." : user?.email || "No Email"}
                                                </div>
                                                <ul className="flex flex-col">
                                                    <li role="menuitem">
                                                        <Link 
                                                            to={getProfilePath(user)}
                                                            className="flex items-center gap-2 px-4 py-2 hover:bg-blue-500/20 rounded-md text-gray-900"
                                                            onClick={() => setOpenMenu(null)}
                                                        >
                                                            <RiUserLine size={16} />
                                                            {isDriver(user) ? 'Driver Profile' : isTechnician(user) ? 'Technician Profile' : 'Profile'}
                                                        </Link>
                                                    </li>
                                                    <li role="menuitem">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                handleLogout();
                                                                setOpenMenu(null);
                                                            }}
                                                            className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-blue-500/20 rounded-md text-gray-900"
                                                        >
                                                            <RiLogoutBoxLine size={16} />
                                                            Logout
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                        </Dropdown>
                                    </div>
                                </div>
            ) : (
                <div className="pr-6 space-x-4">
                    <button
                        type="button"
                        onClick={() => setLoginOpen(true)}
                        className="px-4 py-2 text-blue-500 border border-blue-500 rounded-lg cursor-pointer shadow-md bg-white hover:bg-gray-100"
                    >
                        Sign in
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setRegisterOpen(true)} 
                        className="px-4 py-2 text-white bg-blue-500 rounded-lg border border-blue-500 cursor-pointer hover:bg-blue-600"
                    >
                        Sign up
                    </button>
                </div>
            )}
            </div>
        </nav>

        {/* Mobile Sidebar */}
        <div 
            ref={sidebarRef}
            id="mobile-sidebar"
            className={`fixed top-0 right-0 z-40 h-full w-[80%] max-w-[300px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "translate-x-full"
            } md:hidden`}
        >
            <div className="flex flex-col h-full pt-20 pb-6 overflow-y-auto">
            {/* Mobile User Profile Section */}
        {isAuthenticated ? (
                <div className="flex flex-col items-center p-4 mb-4 border-b">
                <img
                    className="object-cover w-[60px] h-[60px] border-2 border-blue-500 rounded-full shadow-md mb-2"
            src={user?.profilePic || fallbackAvatar}
            alt="Profile"
            loading="lazy"
            onError={(e) => { if (e.currentTarget.src !== fallbackAvatar) e.currentTarget.src = fallbackAvatar; }}
                />
                <span className="text-sm font-medium text-gray-900">
            {(isAuthLoading || userLoading) ? "Loading..." : user?.email || "No Email"}
                </span>
                <div className="flex mt-3 space-x-2">
                    <Link to={getProfilePath(user)} onClick={() => setSidebarOpen(false)}>
            <button type="button" className="flex items-center gap-1 px-3 py-1 text-sm text-blue-800 border border-blue-800 rounded-lg">
                        <RiUserLine size={14} />
                        {isDriver(user) ? 'Driver Profile' : isTechnician(user) ? 'Technician Profile' : 'Profile'}
                    </button>
                    </Link>
            <button 
            type="button"
            className="flex items-center gap-1 px-3 py-1 text-sm text-white bg-blue-500 rounded-lg"
                    onClick={() => {
                        handleLogout();
                        setSidebarOpen(false);
                    }}
                    >
                    <RiLogoutBoxLine size={14} />
                    Logout
                    </button>
                </div>
                </div>
            ) : (
                <div className="flex justify-center p-4 mb-4 space-x-3 border-b">
                                        <button
                                            type="button"
                                            onClick={() => { setLoginOpen(true); setSidebarOpen(false); }}
                                            className="px-4 py-2 text-blue-500 border border-blue-500 rounded-lg"
                                        >
                                            Sign in
                                        </button>
                <button type="button" onClick={() => { setRegisterOpen(true); setSidebarOpen(false); }} className="px-4 py-2 text-white bg-blue-500 rounded-lg">
                    Sign up
                </button>
                </div>
            )}

            {/* Mobile Navigation Links */}
            <div className="flex flex-col px-4">
                <Link 
                to="/" 
                className="py-3 border-b border-gray-200 text-gray-900 hover:text-blue-500"
                onClick={() => setSidebarOpen(false)}
                >
                Home
                </Link>
                
                {isAuthenticated && (
                  <Link 
                  to="/vehicle-registration" 
                  className="py-3 border-b border-gray-200 text-gray-900 hover:text-blue-500"
                  onClick={() => setSidebarOpen(false)}
                  >
                  Register Vehicle
                  </Link>
                )}
                
                <Link 
                to="/fleet" 
                className="py-3 border-b border-gray-200 text-gray-900 hover:text-blue-500"
                onClick={() => setSidebarOpen(false)}
                >
                Our Fleet
                </Link>
                
                <Link 
                to="/contactus" 
                className="py-3 border-b border-gray-200 text-gray-900 hover:text-blue-500"
                onClick={() => setSidebarOpen(false)}
                >
                Contact Us
                </Link>
                
                <Link 
                to="/about-us" 
                className="py-3 border-b border-gray-200 text-gray-900 hover:text-blue-500"
                onClick={() => setSidebarOpen(false)}
                >
                About Us
                </Link>
            </div>
            </div>
        </div>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
            <div 
            className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
            onClick={() => setSidebarOpen(false)}
            />
        )}

        {/* Spacer to push content below navbar */}
        <div className="h-9"></div>

        {/* Login Dialog */}
    <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} onOpenRegister={() => setRegisterOpen(true)} />
    <RegisterDialog open={registerOpen} onClose={() => setRegisterOpen(false)} onSwitchToLogin={() => setLoginOpen(true)} />
    </>
    );
};
