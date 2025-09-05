import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  FaBusAlt, 
  FaShuttleVan, 
  FaCarSide, 
  FaUsers,
  FaSnowflake,
  FaWifi,
  FaChair,
  FaStar
} from "react-icons/fa";
import { 
  GiSteeringWheel, 
  GiGasPump 
} from "react-icons/gi";
import { 
  IoSpeedometerOutline,
  IoSettingsOutline
} from "react-icons/io5";

const VehicleCard = ({ vehicle, isSelected, onClick }) => {
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
      {/* Vehicle Image Placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-blue-700 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-4 right-4 bg-white/90 rounded-full p-2">
          {vehicle.icon}
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
          <h3 className="text-xl font-bold text-gray-900">{vehicle.name}</h3>
          <span className="text-blue-600 font-semibold">{vehicle.price}</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4">{vehicle.type}</p>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaUsers className="w-4 h-4 text-blue-500" />
            <span>{vehicle.capacity} seats</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaSnowflake className="w-4 h-4 text-blue-500" />
            <span>AC</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaWifi className="w-4 h-4 text-blue-500" />
            <span>WiFi</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <GiSteeringWheel className="w-4 h-4 text-blue-500" />
            <span>Auto</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
          <div className="flex items-center gap-1">
            <IoSpeedometerOutline className="w-3 h-3" />
            <span>{vehicle.mileage}</span>
          </div>
          <div className="flex items-center gap-1">
            <GiGasPump className="w-3 h-3" />
            <span>{vehicle.fuel}</span>
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

  const vehicles = [
    { 
      id: 1, 
      name: "Luxury Coach", 
      type: "Premium Long Distance", 
      icon: <FaBusAlt className="w-6 h-6 text-blue-600" />,
      capacity: 40,
      mileage: "8km/L",
      fuel: "Diesel",
      transmission: "Auto",
      price: "Rs. 15,000/day"
    },
    { 
      id: 2, 
      name: "Executive Van", 
      type: "Comfortable Group Travel", 
      icon: <FaShuttleVan className="w-6 h-6 text-blue-600" />,
      capacity: 12,
      mileage: "12km/L",
      fuel: "Petrol",
      transmission: "Auto",
      price: "Rs. 8,000/day"
    },
    { 
      id: 3, 
      name: "Premium Sedan", 
      type: "Business & Wedding", 
      icon: <FaCarSide className="w-6 h-6 text-blue-600" />,
      capacity: 4,
      mileage: "15km/L",
      fuel: "Petrol",
      transmission: "Auto",
      price: "Rs. 5,000/day"
    },
  ];

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {vehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
            >
              <VehicleCard
                vehicle={vehicle}
                isSelected={selectedVehicle === vehicle.id}
                onClick={() => setSelectedVehicle(vehicle.id)}
              />
            </motion.div>
          ))}
        </div>

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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition"
          >
            View Complete Fleet
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  );
};