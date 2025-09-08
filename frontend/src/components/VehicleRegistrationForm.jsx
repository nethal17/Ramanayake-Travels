import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

export const VehicleRegistrationForm = () => {
  const { isAuthenticated, user } = useAuth();
  const [form, setForm] = useState({
    make: "",
    model: "",
    year: "",
    price: "",
    description: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    return <div className="p-6 text-center">Please sign in to register a vehicle for rent.</div>;
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    
    // Add all form fields to FormData
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    // Add user ID if available
    if (user && user._id) {
      formData.append('ownerId', user._id);
      console.log('Including owner ID in form submission:', user._id);
    }
    
    try {
      const res = await fetch("http://localhost:5001/api/vehicles/register", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to register vehicle");
      }
      
      const data = await res.json();
      console.log('Vehicle registered successfully:', data);
      toast.success("Vehicle registered successfully!");
      setForm({ make: "", model: "", year: "", price: "", description: "", image: null });
    } catch (err) {
      console.error('Registration error:', err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="max-w-lg mx-auto p-6 bg-white rounded shadow" onSubmit={handleSubmit} encType="multipart/form-data">
      <h2 className="text-2xl font-bold mb-4">Register Your Vehicle for Rent</h2>
      <div className="mb-3">
        <label className="block mb-1 font-medium">Make</label>
        <input name="make" value={form.make} onChange={handleChange} required className="w-full border rounded p-2" />
      </div>
      <div className="mb-3">
        <label className="block mb-1 font-medium">Model</label>
        <input name="model" value={form.model} onChange={handleChange} required className="w-full border rounded p-2" />
      </div>
      <div className="mb-3">
        <label className="block mb-1 font-medium">Year</label>
        <input name="year" value={form.year} onChange={handleChange} required type="number" className="w-full border rounded p-2" />
      </div>
      <div className="mb-3">
        <label className="block mb-1 font-medium">Price per day (LKR)</label>
        <input name="price" value={form.price} onChange={handleChange} required type="number" className="w-full border rounded p-2" />
      </div>
      <div className="mb-3">
        <label className="block mb-1 font-medium">Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} required className="w-full border rounded p-2" />
      </div>
      <div className="mb-3">
        <label className="block mb-1 font-medium">Image</label>
        <input name="image" type="file" accept="image/*" onChange={handleChange} className="w-full" />
      </div>
      <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
        {loading ? "Registering..." : "Register Vehicle"}
      </button>
    </form>
  );
};
