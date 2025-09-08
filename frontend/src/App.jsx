import React from 'react';
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';


function App() {
  return (
    <div className='min-h-screen bg-white'>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

export default App;
