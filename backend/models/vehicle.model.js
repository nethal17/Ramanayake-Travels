import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
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
  ownership: { 
    type: String, 
    enum: ['Customer', 'Company'], 
    required: true 
  },
  ownerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VehicleApplication'
  },
  status: { 
    type: String, 
    enum: ['available', 'rented', 'maintenance', 'unavailable'], 
    default: 'available' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add index for faster searches
vehicleSchema.index({ make: 1, model: 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ ownership: 1 });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
