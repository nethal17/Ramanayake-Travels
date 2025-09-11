import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./hooks/useAuth";

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';

// Customer Pages
import ContactUs from './pages/ContactUs';
import AboutUs from './pages/AboutUs';
import VehicleRegistrationPage from './pages/VehicleRegistrationPage';
import ProfilePage from './pages/ProfilePage';
import FleetPage from './pages/FleetPage';
import VehicleDetailsPage from './pages/VehicleDetailsPage';
import ReservationConfirmation from './pages/ReservationConfirmation';
import DriverProfilePage from './pages/DriverProfilePage';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminVehicleApplications from './components/AdminVehicleApplications';
import AdminVehiclesList from './pages/AdminVehiclesList';
import AdminVehicleRegister from './pages/AdminVehicleRegister';
import CompanyVehicleRegister from './pages/CompanyVehicleRegister';
import AdminReservations from './pages/AdminReservations';
import AddDriverPage from './pages/AddDriverPage';
import DriverListPage from './pages/DriverListPage';

import HomePage from './pages/HomePage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Profile redirect component
function ProfileRedirect() {
  const { user, isAuthLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        // Not logged in, redirect to home
        navigate('/', { replace: true });
      } else if (user.role === 'driver') {
        console.log('User is a driver, redirecting to driver profile');
        navigate('/driver-profile', { replace: true });
      } else {
        // Default to customer profile for all other roles
        console.log('User is not a driver, redirecting to customer profile');
        navigate('/customer-profile', { replace: true });
      }
    }
  }, [user, isAuthLoading, navigate]);
  
  return null; // Render nothing while redirecting
}


function App() {
  return (
    <>
      <Routes>
        {/* Customer/Public Routes */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/vehicle-registration" element={<VehicleRegistrationPage />} />
          <Route path="/profile" element={<ProfileRedirect />} />
          <Route path="/driver-profile" element={<DriverProfilePage />} />
          <Route path="/customer-profile" element={<ProfilePage />} />
          <Route path="/fleet" element={<FleetPage />} />
          <Route path="/fleet/vehicles/:id" element={<VehicleDetailsPage />} />
          <Route path="/reservation-confirmation" element={<ReservationConfirmation />} />
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="" element={<Navigate replace to="/admin/dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="vehicle-applications" element={<AdminVehicleApplications />} />
          <Route path="vehicles-list" element={<AdminVehiclesList />} />
          <Route path="vehicle-register" element={<AdminVehicleRegister />} />
          <Route path="company-vehicle-register" element={<CompanyVehicleRegister />} />
          <Route path="reservations" element={<AdminReservations />} />
          <Route path="add-driver" element={<AddDriverPage />} />
          <Route path="driver-list" element={<DriverListPage />} />
          {/* Add more admin routes as needed */}
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate replace to="/" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default App;
