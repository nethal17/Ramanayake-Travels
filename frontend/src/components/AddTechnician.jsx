
import React, { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AddTechnician = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    address: '',
    specialization: '',
    experience: '',
    certName: '',
    certIssueDate: '',
    certExpiryDate: '',
    certificateImage: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'certificateImage' && files && files[0]) {
      setFormData({
        ...formData,
        [name]: files[0]
      });
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(files[0]);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formDataObj = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'certificateImage' && formData[key]) {
          formDataObj.append(key, formData[key]);
        } else if (formData[key]) {
          formDataObj.append(key, formData[key]);
        }
      });
      const response = await api.post(
        '/technicians',
        formDataObj,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      if (response.data.success) {
        toast.success('Technician created successfully');
        navigate('/admin/technician-management');
      } else {
        toast.error(response.data.message || 'Failed to create technician');
      }
    } catch (error) {
      console.error('Error creating technician:', error);
      toast.error(error.response?.data?.message || 'Error creating technician');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add Technician</h2>
      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Age</label>
            <input type="number" name="age" value={formData.age} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Specialization</label>
            <input type="text" name="specialization" value={formData.specialization} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Experience (years)</label>
            <input type="number" name="experience" value={formData.experience} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Certification Name</label>
            <input type="text" name="certName" value={formData.certName} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Issue Date</label>
            <input type="date" name="certIssueDate" value={formData.certIssueDate} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Expiry Date (optional)</label>
            <input type="date" name="certExpiryDate" value={formData.certExpiryDate} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Certificate Image</label>
            <input type="file" name="certificateImage" onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" accept="image/*" required />
            {imagePreview && (
              <div className="mt-2">
                <img src={imagePreview} alt="Certificate Preview" className="h-32 object-contain" />
              </div>
            )}
          </div>
        </div>
        <div className="pt-4 flex gap-2">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Technician'}
          </button>
          <button type="button" onClick={() => navigate('/admin/technician-management')} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddTechnician;
