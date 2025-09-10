import React from "react";
import { motion } from "framer-motion";
import { 
  FaBusAlt, 
  FaShuttleVan, 
  FaCarSide, 
  FaUsers,
  FaGasPump,
  FaCog,
  FaStar,
  FaImage,
  FaCalendarAlt,
  FaInfoCircle,
  FaDoorOpen
} from "react-icons/fa";
import backgroundImage from "../assets/image1.jpg";
import { Link } from "react-router-dom";

const VehicleCard = ({ vehicle }) => {
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
    _id: vehicle._id || "unknown",
    make: vehicle.make || "Unknown Make",
    model: vehicle.model || "Unknown Model",
    year: vehicle.year || "N/A",
    price: vehicle.price || 0,
    description: vehicle.description || "No description available",
    imageUrl: vehicle.imageUrl || null,
    ownership: vehicle.ownership || "Company",
    status: vehicle.status || "available",
    fuelType: vehicle.fuelType || "Petrol",
    transmission: vehicle.transmission || "Manual",
    seats: vehicle.seats || 5,
    doors: vehicle.doors || 4,
    extraOptions: vehicle.extraOptions || []
  };

  // Determine vehicle type based on make/model keywords
  const getVehicleType = () => {
    const combined = (vehicleData.make + ' ' + vehicleData.model).toLowerCase();
    if (combined.includes('bus') || combined.includes('coach')) return 'bus';
    if (combined.includes('van') || combined.includes('hiace')) return 'van';
    return 'car';
  };

  // Choose icon based on vehicle type
  const getVehicleIcon = () => {
    const type = getVehicleType();
    if (type === 'bus') return <FaBusAlt className="w-5 h-5 text-blue-600" />;
    if (type === 'van') return <FaShuttleVan className="w-5 h-5 text-blue-600" />;
    return <FaCarSide className="w-5 h-5 text-blue-600" />;
  };

  // Format price with commas
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  return (
    <motion.div
      className="border border-gray-200 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-4 bg-white"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Vehicle Image with Fallback */}
      <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-blue-200 rounded-md mb-4 flex items-center justify-center overflow-hidden relative">
        {vehicleData.imageUrl ? (
          <img
            src={vehicleData.imageUrl}
            alt={`${vehicleData.make} ${vehicleData.model}`}
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
        
        {/* Ownership Badge */}
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 text-xs font-semibold">
          {vehicleData.ownership === 'Company' ? 
            <span className="text-blue-600">Company</span> : 
            <span className="text-green-600">Customer</span>
          }
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          {getVehicleIcon()}
          <h3 className="text-lg font-semibold text-gray-900">{vehicleData.make} {vehicleData.model}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600 mb-1">
          <div className="flex items-center gap-1">
            <FaCalendarAlt />
            <span>{vehicleData.year}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaGasPump />
            <span>{vehicleData.fuelType}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaCog />
            <span>{vehicleData.transmission}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <FaUsers />
            <span>{vehicleData.seats} seats</span>
          </div>
          <div className="flex items-center gap-1">
            <FaDoorOpen />
            <span>{vehicleData.doors} doors</span>
          </div>
        </div>
      </div>

      {/* Description - Truncated */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {vehicleData.description}
      </p>

      {/* Price and Action Button */}
      <div className="flex items-center justify-between">
        <div className="font-bold text-blue-600">
          Rs {formatPrice(vehicleData.price)}<span className="text-sm font-normal">/day</span>
        </div>
        <Link 
          to={`/fleet/vehicles/${vehicleData._id}`}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
        >
          <FaInfoCircle />
          <span>Details</span>
        </Link>
      </div>
    </motion.div>
  );
};

export default VehicleCard;