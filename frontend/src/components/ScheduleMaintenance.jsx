
import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ScheduleMaintenance = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: '',
    scheduledDate: '',
    maintenanceType: '',
    description: '',
    cost: '',
    technicianId: ''
  });

  useEffect(() => {
    fetchVehicles();
    fetchTechnicians();
  }, []);


  const fetchVehicles = async () => {
    try {
      const url = '/vehicles';
      const response = await api.get(url, { withCredentials: true });
      console.log('fetchVehicles URL:', url);
      console.log('fetchVehicles response:', response);
      let vehiclesArr = [];
      // If response.data is an array (as per your log), use it directly
      if (Array.isArray(response.data)) {
        vehiclesArr = response.data.filter(v => v && v.ownership === 'Company');
      } else if (response.data.success && Array.isArray(response.data.vehicles)) {
        // fallback for old API shape
        vehiclesArr = response.data.vehicles.filter(v => v && v.ownership === 'Company');
      }
      setVehicles(vehiclesArr);
      if (!vehiclesArr.length) {
        toast.error('No company vehicles found');
      }
    } catch (error) {
      setVehicles([]);
      console.log('fetchVehicles error:', error);
      toast.error('Error loading vehicles');
    }
  };

  const fetchTechnicians = async () => {
    try {
      const url = '/technicians';
      const response = await api.get(url, { withCredentials: true });
      console.log('fetchTechnicians URL:', url);
      console.log('fetchTechnicians response:', response);
      let availableTechnicians = [];
      if (response.data.success && Array.isArray(response.data.data)) {
        availableTechnicians = response.data.data.filter(t => t && t.availability);
      }
      setTechnicians(availableTechnicians);
      if (!response.data.success) {
        toast.error('Failed to load technicians');
      }
    } catch (error) {
      setTechnicians([]);
      console.log('fetchTechnicians error:', error);
      toast.error('Error loading technicians');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Map frontend field names to backend
    if (name === 'estimatedCost') {
      setFormData({ ...formData, cost: value });
    } else if (name === 'assignedTechnicianId') {
      setFormData({ ...formData, technicianId: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  // No need to check userId for createdBy anymore
    if (!formData.vehicleId) {
      toast.error('Please select a vehicle.');
      return;
    }
    setLoading(true);
    try {
      // Prepare payload with correct fields
      const payload = {
        ...formData
      };
      // Remove empty technicianId if not assigned
      if (!payload.technicianId) delete payload.technicianId;
      // Convert cost to number
      if (payload.cost) payload.cost = Number(payload.cost);
      // Never send status from frontend
      if (payload.status) delete payload.status;
      const response = await api.post('/maintenance', payload, { withCredentials: true });
      if (response.data.success) {
        toast.success('Maintenance scheduled successfully');
        navigate('/admin/maintenance-management');
      } else {
        toast.error(response.data.message || 'Failed to schedule maintenance');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error scheduling maintenance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Schedule Maintenance</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Vehicle</label>
          <select
            name="vehicleId"
            value={formData.vehicleId}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="">Select a Vehicle</option>
            {Array.isArray(vehicles) && vehicles.length > 0 ? (
              vehicles.map(vehicle => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.make} {vehicle.model} ({vehicle.registrationNumber})
                </option>
              ))
            ) : (
              <option value="" disabled>No vehicles available</option>
            )}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Maintenance Type</label>
          <select
            name="maintenanceType"
            value={formData.maintenanceType}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="">Select Type</option>
            <option value="Regular Service">Regular Service</option>
            <option value="Repair">Repair</option>
            <option value="Inspection">Inspection</option>
            <option value="Tire Change">Tire Change</option>
            <option value="Oil Change">Oil Change</option>
            <option value="Major Overhaul">Major Overhaul</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Scheduled Date</label>
          <input
            type="date"
            name="scheduledDate"
            value={formData.scheduledDate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Describe the maintenance needed"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Estimated Cost ($)</label>
          <input
            type="number"
            name="cost"
            value={formData.cost}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Assign Technician (Optional)</label>
          <select
            name="technicianId"
            value={formData.technicianId}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select a Technician</option>
            {Array.isArray(technicians) && technicians.length > 0 ? (
              technicians.map(technician => (
                <option key={technician._id} value={technician._id}>
                  {technician.userId?.name || 'Unknown'} - {technician.specialization || ''}
                </option>
              ))
            ) : (
              <option value="" disabled>No technicians available</option>
            )}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Note: Only available technicians are shown. You can assign a technician later.
          </p>
        </div>
        <div className="pt-4 flex gap-2">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Scheduling...' : 'Schedule Maintenance'}
          </button>
          <button type="button" onClick={() => navigate('/admin/maintenance-management')} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleMaintenance;
