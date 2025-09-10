import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import { 
  FaBusAlt, 
  FaShuttleVan, 
  FaCarSide, 
  FaUsers,
  FaSnowflake,
  FaWifi,
  FaChair,
  FaStar,
  FaGasPump,
  FaDoorOpen,
  FaCogs
} from "react-icons/fa";
import { 
  GiSteeringWheel
} from "react-icons/gi";
import { 
  IoSpeedometerOutline,
  IoSettingsOutline
} from "react-icons/io5";

const VehicleCard = ({ vehicle, isSelected, onClick }) => {
  // Default image fallback background gradient
  const bgGradient = "bg-gradient-to-br from-blue-500 to-blue-700";
  
  // Determine vehicle type based on make/model keywords
  const getVehicleType = () => {
    const combined = (vehicle.make + ' ' + vehicle.model).toLowerCase();
    if (combined.includes('bus') || combined.includes('coach')) return 'bus';
    if (combined.includes('van') || combined.includes('hiace')) return 'van';
    return 'car';
  };

  // Choose icon based on vehicle type
  const getVehicleIcon = () => {
    const type = getVehicleType();
    if (type === 'bus') return <FaBusAlt className="w-6 h-6 text-blue-600" />;
    if (type === 'van') return <FaShuttleVan className="w-6 h-6 text-blue-600" />;
    return <FaCarSide className="w-6 h-6 text-blue-600" />;
  };
  
  // Get vehicle type description
  const getVehicleTypeDescription = () => {
    const type = getVehicleType();
    if (type === 'bus') return "Premium Long Distance";
    if (type === 'van') return "Comfortable Group Travel";
    return "Business & Personal Travel";
  };
  
  // Format price with commas
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  return (
    <motion.div
      className={`relative bg-white rounded-xl overflow-hidden border-2 transition-all duration-300 ${
        isSelected 
          ? 'border-blue-600 shadow-2xl' 
          : 'border-gray-200 hover:border-blue-400 shadow-lg hover:shadow-xl'
      }`}
      whileHover={{ y: -5 }}
      onClick={onClick}
    >
      {/* Vehicle Image */}
      <div className={`relative h-48 ${bgGradient} overflow-hidden`}>
        {vehicle.imageUrl && (
          <img 
            src={vehicle.imageUrl} 
            alt={`${vehicle.make} ${vehicle.model}`}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => e.target.style.display = 'none'}
          />
        )}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-4 right-4 bg-white/90 rounded-full p-2">
          {getVehicleIcon()}
        </div>
        {/* Rating Badge */}
        <div className="absolute top-4 left-4 bg-yellow-400 text-white px-3 py-1 rounded-full flex items-center gap-1">
          <FaStar className="w-3 h-3" />
          <span className="text-sm font-bold">4.8</span>
        </div>
      </div>

      {/* Vehicle Details */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900 truncate">{vehicle.make} {vehicle.model}</h3>
          <span className="text-blue-600 font-semibold">Rs. {formatPrice(vehicle.price)}/day</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4">{getVehicleTypeDescription()}</p>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaUsers className="w-4 h-4 text-blue-500" />
            <span>{vehicle.seats} seats</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaDoorOpen className="w-4 h-4 text-blue-500" />
            <span>{vehicle.doors} doors</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaCogs className="w-4 h-4 text-blue-500" />
            <span>{vehicle.transmission}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaGasPump className="w-4 h-4 text-blue-500" />
            <span>{vehicle.fuelType}</span>
          </div>
        </div>

        {/* Extra Features */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {vehicle.extraOptions && vehicle.extraOptions.slice(0, 3).map((option, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {option}
            </span>
          ))}
          {vehicle.extraOptions && vehicle.extraOptions.length > 3 && (
            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
              +{vehicle.extraOptions.length - 3} more
            </span>
          )}
        </div>

        {/* Quick Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
          <div className="flex items-center gap-1">
            <IoSpeedometerOutline className="w-3 h-3" />
            <span>Year: {vehicle.year}</span>
          </div>
          <div className="flex items-center gap-1">
            <IoSettingsOutline className="w-3 h-3" />
            <span>{vehicle.transmission}</span>
          </div>
        </div>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      )}
    </motion.div>
  );
};

export const FeaturedVehicles = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        // Fetch all available vehicles
        const response = await axios.get('http://localhost:5001/api/vehicles/search');
        
        // Sort vehicles by price (highest first) and take the first 3
        const sortedVehicles = response.data
          .sort((a, b) => b.price - a.price) // Sort by price, highest first
          .slice(0, 3); // Take only first 3 vehicles
        
        setVehicles(sortedVehicles);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching featured vehicles:', err);
        setError('Failed to load featured vehicles');
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  return (
    <motion.section
      id="fleet"
      className="py-16 px-6 bg-gradient-to-b from-blue-50 to-white"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            whileHover={{ rotate: 5, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FaBusAlt className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Premium <span className="text-blue-600">Fleet</span> Collection
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Discover our exceptional range of vehicles, each maintained to the highest standards 
            for your comfort and safety. Perfect for every occasion and journey.
          </p>
        </motion.div>

        {/* Vehicle Cards Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center p-8 bg-red-50 rounded-lg text-red-600">
            <p>{error}</p>
            <p className="mt-2 text-sm">Please try again later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {vehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle._id}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
              >
                <VehicleCard
                  vehicle={vehicle}
                  isSelected={selectedVehicle === vehicle._id}
                  onClick={() => setSelectedVehicle(vehicle._id)}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Features Banner */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-8"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: FaSnowflake, label: "AC Climate Control", color: "text-blue-500" },
              { icon: FaWifi, label: "Free WiFi", color: "text-blue-500" },
              { icon: FaChair, label: "Luxury Seating", color: "text-blue-500" },
              { icon: GiSteeringWheel, label: "Expert Drivers", color: "text-blue-500" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={`w-12 h-12 ${feature.color} mx-auto mb-3 flex items-center justify-center`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-gray-700">{feature.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          className="text-center mt-8"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Link to="/fleet">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition"
            >
              View Complete Fleet
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
};