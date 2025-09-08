import React from 'react';
import { FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

const DeleteConfirmationModal = ({ vehicle, onClose, onConfirm, isDeleting }) => {
  if (!vehicle) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center mb-4 text-red-600">
            <FaExclamationTriangle size={24} className="mr-3" />
            <h3 className="text-lg font-bold">Delete Vehicle</h3>
          </div>
          
          <p className="mb-4 text-gray-700">
            Are you sure you want to delete this vehicle?
            <span className="font-semibold block mt-2">
              {vehicle.make} {vehicle.model} ({vehicle.year})
            </span>
          </p>
          
          <p className="text-sm text-gray-500 mb-6">
            This action cannot be undone.
          </p>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(vehicle._id)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
