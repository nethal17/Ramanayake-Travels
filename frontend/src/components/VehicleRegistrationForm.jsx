import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

export const VehicleRegistrationForm = () => {
  const { isAuthenticated, user, getAuthHeaders } = useAuth();
  const [form, setForm] = useState({
    make: "",
    model: "",
    year: "",
    price: "",
    description: "",
    fuelType: "Petrol",
    seats: "",
    doors: "",
    transmission: "Manual",
    extraOptions: [],
    image: null,
  });
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    return <div className="p-6 text-center">Please sign in to register a vehicle for rent.</div>;
  }

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    
    // Handle file uploads
    if (files) {
      setForm((prev) => ({
        ...prev,
        [name]: files[0],
      }));
      return;
    }
    
    // Handle checkboxes for extra options
    if (type === 'checkbox') {
      const options = [...form.extraOptions];
      if (checked) {
        options.push(value);
      } else {
        const index = options.indexOf(value);
        if (index > -1) {
          options.splice(index, 1);
        }
      }
      setForm((prev) => ({
        ...prev,
        extraOptions: options,
      }));
      return;
    }
    
    // Handle other inputs
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    
    // Add all form fields to FormData
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'extraOptions' && Array.isArray(value)) {
        // Handle array of extra options
        value.forEach(option => formData.append('extraOptions', option));
      } else if (key !== 'image') { // Skip image as it's handled separately
        formData.append(key, value);
      }
    });
    
    // Add image file if it exists
    if (form.image) {
      formData.append('image', form.image);
    }
    
    // Add user ID if available
    if (user && user._id) {
      formData.append('ownerId', user._id);
      console.log('Including owner ID in form submission:', user._id);
    }
    
    try {
      // When using FormData, don't set Content-Type as it will be set automatically with the correct boundary
      const token = localStorage.getItem('token');
      
      console.log('Token exists:', !!token);
      
      const res = await fetch("http://localhost:5001/api/vehicles/register", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Server error response:', errorData);
        throw new Error(errorData.error || "Failed to register vehicle");
      }
      
      const data = await res.json();
      console.log('Vehicle registered successfully:', data);
      toast.success("Vehicle registered successfully!");
      setForm({ 
        make: "", 
        model: "", 
        year: "", 
        price: "", 
        description: "", 
        fuelType: "Petrol",
        seats: "",
        doors: "",
        transmission: "Manual",
        extraOptions: [],
        image: null 
      });
    } catch (err) {
      console.error('Registration error:', err);
      let errorMessage = "Failed to register vehicle";
      
      // Try to extract more specific error message if available
      if (err.message && err.message !== "Failed to register vehicle") {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="max-w-lg mx-auto p-6 bg-white rounded shadow" onSubmit={handleSubmit} encType="multipart/form-data">
      <h2 className="text-2xl font-bold mb-4">Register Your Vehicle for Rent</h2>
      
      {/* Basic Info Section */}
      <div className="mb-5 border-b pb-4">
        <h3 className="text-lg font-semibold mb-3">Vehicle Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 font-medium">Make</label>
            <input name="make" value={form.make} onChange={handleChange} required className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Model</label>
            <input name="model" value={form.model} onChange={handleChange} required className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Year</label>
            <input name="year" value={form.year} onChange={handleChange} required type="number" className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Price per day (LKR)</label>
            <input name="price" value={form.price} onChange={handleChange} required type="number" className="w-full border rounded p-2" />
          </div>
        </div>
      </div>
      
      {/* Specifications Section */}
      <div className="mb-5 border-b pb-4">
        <h3 className="text-lg font-semibold mb-3">Vehicle Specifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 font-medium">Fuel Type</label>
            <select name="fuelType" value={form.fuelType} onChange={handleChange} required className="w-full border rounded p-2">
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Transmission</label>
            <select name="transmission" value={form.transmission} onChange={handleChange} required className="w-full border rounded p-2">
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
              <option value="Semi-Automatic">Semi-Automatic</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Number of Seats</label>
            <input name="seats" value={form.seats} onChange={handleChange} required type="number" min="1" max="50" className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Number of Doors</label>
            <input name="doors" value={form.doors} onChange={handleChange} required type="number" min="1" max="6" className="w-full border rounded p-2" />
          </div>
        </div>
      </div>
      
      {/* Extra Options Section */}
      <div className="mb-5 border-b pb-4">
        <h3 className="text-lg font-semibold mb-2">Extra Options</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="extraOptions" value="Air Conditioning" checked={form.extraOptions.includes('Air Conditioning')} onChange={handleChange} className="rounded" />
            <span>Air Conditioning</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="extraOptions" value="GPS" checked={form.extraOptions.includes('GPS')} onChange={handleChange} className="rounded" />
            <span>GPS</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="extraOptions" value="Bluetooth" checked={form.extraOptions.includes('Bluetooth')} onChange={handleChange} className="rounded" />
            <span>Bluetooth</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="extraOptions" value="Leather Seats" checked={form.extraOptions.includes('Leather Seats')} onChange={handleChange} className="rounded" />
            <span>Leather Seats</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="extraOptions" value="Sunroof" checked={form.extraOptions.includes('Sunroof')} onChange={handleChange} className="rounded" />
            <span>Sunroof</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="extraOptions" value="Child Seats" checked={form.extraOptions.includes('Child Seats')} onChange={handleChange} className="rounded" />
            <span>Child Seats</span>
          </label>
        </div>
      </div>
      
      {/* Description and Image Section */}
      <div className="mb-5">
        <div className="mb-3">
          <label className="block mb-1 font-medium">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} required className="w-full border rounded p-2 h-24" />
        </div>
        <div className="mb-3">
          <label className="block mb-1 font-medium">Image</label>
          <input name="image" type="file" accept="image/*" onChange={handleChange} className="w-full" />
        </div>
      </div>
      
      <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
        {loading ? "Registering..." : "Register Vehicle"}
      </button>
    </form>
  );
};
