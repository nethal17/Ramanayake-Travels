import React from "react";
import { motion } from "framer-motion";
import { 
  FaBusAlt, 
  FaShuttleVan, 
  FaCarSide, 
  FaUsers,
  FaSnowflake,
  FaWifi,
  FaStar,
  FaImage
} from "react-icons/fa";
import backgroundImage from "../assets/image1.jpg";

export const VehicleCard = ({ vehicle }) => {
  // Handle undefined vehicle prop
  if (!vehicle) {
    return (
      <div className="border border-gray-200 rounded-lg shadow-md p-4 bg-gray-50 animate-pulse">
        <div className="w-full h-40 bg-gray-300 rounded-md mb-4 flex items-center justify-center">
          <FaImage className="text-gray-400 text-2xl" />
        </div>
        <div className="h-6 bg-gray-300 rounded mb-2"></div>
        <div className="h-4 bg-gray-300 rounded mb-4"></div>
        <div className="h-10 bg-gray-300 rounded"></div>
      </div>
    );
  }

  // Default values for missing properties
  const vehicleData = {
    name: vehicle.name || "Unknown Vehicle",
    type: vehicle.type || "Standard",
    image: vehicle.image || null,
    capacity: vehicle.capacity || 4,
    hasAC: vehicle.hasAC !== undefined ? vehicle.hasAC : true,
    hasWifi: vehicle.hasWifi !== undefined ? vehicle.hasWifi : false,
    rating: vehicle.rating || 4.5,
    price: vehicle.price || "Contact for price"
  };

  // Choose icon based on vehicle type
  const getVehicleIcon = () => {
    const name = vehicleData.name.toLowerCase();
    if (name.includes("bus")) return <FaBusAlt className="w-5 h-5 text-blue-600" />;
    if (name.includes("van")) return <FaShuttleVan className="w-5 h-5 text-blue-600" />;
    return <FaCarSide className="w-5 h-5 text-blue-600" />;
  };

  return (
    <motion.div
      className="border border-gray-200 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-4 bg-white"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Vehicle Image with Fallback - Using backgroundImage as fallback */}
      <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-blue-200 rounded-md mb-4 flex items-center justify-center overflow-hidden relative">
        {vehicleData.image ? (
          <img
            src={vehicleData.image}
            alt={vehicleData.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              // Show background image fallback when image fails to load
              const fallback = e.target.parentElement;
              fallback.style.backgroundImage = `url(${backgroundImage})`;
              fallback.style.backgroundSize = 'cover';
              fallback.style.backgroundPosition = 'center';
            }}
          />
        ) : (
          // Use background image directly when no vehicle image is provided
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          >
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="flex flex-col items-center justify-center text-white">
                <FaImage className="text-3xl mb-2" />
                <span className="text-sm">Vehicle Image</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Rating Badge */}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 text-xs font-semibold">
          <FaStar className="text-yellow-400" />
          <span>{vehicleData.rating}</span>
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          {getVehicleIcon()}
          <h3 className="text-lg font-semibold text-gray-900">{vehicleData.name}</h3>
        </div>
        <p className="text-gray-600 text-sm">{vehicleData.type}</p>
      </div>

      {/* Features */}
      <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <FaUsers className="w-3 h-3" />
          <span>{vehicleData.capacity} seats</span>
        </div>
        {vehicleData.hasAC && (
          <div className="flex items-center gap-1">
            <FaSnowflake className="w-3 h-3" />
            <span>AC</span>
          </div>
        )}
        {vehicleData.hasWifi && (
          <div className="flex items-center gap-1">
            <FaWifi className="w-3 h-3" />
            <span>WiFi</span>
          </div>
        )}
      </div>

      {/* Price and Action */}
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-blue-600">{vehicleData.price}</span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Book Now
        </motion.button>
      </div>
    </motion.div>
  );
};

// Default props for safety
VehicleCard.defaultProps = {
  vehicle: null
};