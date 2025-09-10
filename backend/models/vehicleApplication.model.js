import mongoose from 'mongoose';

const vehicleApplicationSchema = new mongoose.Schema({
  
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  // New fields
  fuelType: { type: String, enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Other'], required: true },
  seats: { type: Number, required: true },
  doors: { type: Number, required: true },
  transmission: { type: String, enum: ['Manual', 'Automatic', 'Semi-Automatic'], required: true },
  extraOptions: { type: [String], default: [] }, // Array of strings for extra options
  // Existing fields
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const VehicleApplication = mongoose.model('VehicleApplication', vehicleApplicationSchema);
export default VehicleApplication;
