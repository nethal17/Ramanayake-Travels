import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaSearchLocation, 
  FaCalendarAlt, 
  FaBusAlt, 
  FaSearch,
  FaUsers,
  FaMapMarkerAlt,
  FaCar,
  FaShuttleVan
} from "react-icons/fa";
import { 
  IoLocationSharp,
  IoCalendarClear,
  IoCarSport,
  IoPeople
} from "react-icons/io5";
import backgroundImage from "../assets/image1.jpg";

export const SearchBar = () => {
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  const vehicleOptions = [
    { value: "bus", label: "Luxury Bus", icon: <FaBusAlt className="w-4 h-4" /> },
    { value: "van", label: "Executive Van", icon: <FaShuttleVan className="w-4 h-4" /> },
    { value: "car", label: "Premium Car", icon: <FaCar className="w-4 h-4" /> },
    { value: "minibus", label: "Mini Bus", icon: <IoCarSport className="w-4 h-4" /> }
  ];

  const handleSearch = () => {
    console.log({ destination, date, vehicleType, passengers });
  };

  return (
    <motion.div
      id="search"
      className="relative w-full shadow-2xl overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "550px", // slightly shorter image
      }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content container aligned lower */}
      <div className="relative z-10 flex flex-col items-center justify-end h-full px-4 md:px-8 lg:px-16 pb-12 mt-12">
        {/* Header Section */}
        <motion.div
          className="text-center mb-8 text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="w-20 h-20 bg-white/10 rounded-3xl mx-auto mb-4 flex items-center justify-center backdrop-blur-md shadow-lg"
            whileHover={{ rotate: 10, scale: 1.15 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FaBusAlt className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-3">
            Find Your Perfect <span className="text-blue-500">Ride</span>
          </h2>
          <p className="text-blue-300 text-lg md:text-xl opacity-90">
            Book premium transportation with just a few clicks
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          className="bg-white/30 backdrop-blur-md rounded-3xl p-8 shadow-2xl w-full max-w-4xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
            {/* Destination */}
            <motion.div className="lg:col-span-4" whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <IoLocationSharp className="text-blue-400" />
                Destination
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Where to?"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <FaSearchLocation className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              </div>
            </motion.div>

            {/* Date */}
            <motion.div className="lg:col-span-3" whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <IoCalendarClear className="text-blue-400" />
                Travel Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              </div>
            </motion.div>

            {/* Vehicle Type */}
            <motion.div className="lg:col-span-3" whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <IoCarSport className="text-blue-400" />
                Vehicle Type
              </label>
              <div className="relative">
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none"
                >
                  <option value="">Select vehicle</option>
                  {vehicleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <FaBusAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              </div>
            </motion.div>

            {/* Search Button */}
            <motion.div className="lg:col-span-2 flex items-end" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSearch}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
              >
                <FaSearch className="w-4 h-4" />
                Search
              </motion.button>
            </motion.div>
          </div>

          {/* Advanced Options */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mt-4 pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <IoPeople className="text-blue-500" />
                      Passengers
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={passengers}
                        onChange={(e) => setPassengers(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                      <FaUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                    </div>
                  </motion.div>

                  <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-blue-500" />
                      Pickup Location
                    </label>
                    <input
                      type="text"
                      placeholder="Enter pickup location"
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};
