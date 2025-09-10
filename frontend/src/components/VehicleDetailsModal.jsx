import React from 'react';
import { FaTimes, FaCalendarAlt, FaMoneyBillWave, FaUser, FaCheckCircle, FaCarSide, FaGasPump, FaCog, FaUsers, FaDoorOpen } from 'react-icons/fa';

const VehicleDetailsModal = ({ vehicle, onClose }) => {
  if (!vehicle) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-90vh overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Vehicle Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <FaTimes size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Vehicle Image */}
            <div className="md:w-1/3">
              <div className="bg-gray-200 rounded-lg overflow-hidden h-56 flex items-center justify-center">
                {vehicle.imageUrl ? (
                  <img 
                    src={vehicle.imageUrl} 
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaCarSide size={64} className="text-gray-400" />
                )}
              </div>
            </div>
            
            {/* Vehicle Details */}
            <div className="md:w-2/3">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {vehicle.make} {vehicle.model} ({vehicle.year})
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <FaMoneyBillWave className="text-green-600" />
                  <span className="text-gray-700">
                    <span className="font-semibold">Price:</span> Rs. {vehicle.price?.toLocaleString()} / day
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <FaCalendarAlt className="text-blue-600" />
                  <span className="text-gray-700">
                    <span className="font-semibold">Year:</span> {vehicle.year}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <FaGasPump className="text-red-600" />
                  <span className="text-gray-700">
                    <span className="font-semibold">Fuel:</span> {vehicle.fuelType || 'Not specified'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <FaCog className="text-gray-600" />
                  <span className="text-gray-700">
                    <span className="font-semibold">Transmission:</span> {vehicle.transmission || 'Not specified'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <FaUsers className="text-indigo-600" />
                  <span className="text-gray-700">
                    <span className="font-semibold">Seats:</span> {vehicle.seats || 'Not specified'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <FaDoorOpen className="text-amber-600" />
                  <span className="text-gray-700">
                    <span className="font-semibold">Doors:</span> {vehicle.doors || 'Not specified'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <FaUser className="text-purple-600" />
                  <span className="text-gray-700">
                    <span className="font-semibold">Ownership:</span> {vehicle.ownership}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <FaCheckCircle className={
                    vehicle.status === 'available' ? 'text-green-600' :
                    vehicle.status === 'maintenance' ? 'text-yellow-600' :
                    vehicle.status === 'rented' ? 'text-blue-600' : 'text-red-600'
                  } />
                  <span className="text-gray-700">
                    <span className="font-semibold">Status:</span> {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                  </span>
                </div>
              </div>
              
              {/* Extra Options */}
              {vehicle.extraOptions && vehicle.extraOptions.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Extra Options</h4>
                  <div className="flex flex-wrap gap-2">
                    {vehicle.extraOptions.map((option, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
                        {option}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                <p className="text-gray-700 whitespace-pre-line">{vehicle.description}</p>
              </div>
              
              {vehicle.ownership === 'Customer' && vehicle.ownerId && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Owner Information</h4>
                  <p className="text-gray-700">
                    {vehicle.ownerId.name || 'N/A'} 
                    {vehicle.ownerId.email && ` • ${vehicle.ownerId.email}`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsModal;
