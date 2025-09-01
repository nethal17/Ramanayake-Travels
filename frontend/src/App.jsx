import React from 'react';
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import HomePage from './pages/HomePage';
import { Navbar } from './components/Navbar';

function App() {
  return (
    <div className='min-h-screen bg-white'>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

export default App;
