import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  licenseNumber: { 
    type: String, 
    required: true 
  },
  experience: { 
    type: Number, // Experience in years
    required: true 
  },
  contactNumber: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String 
  },
  dailyRate: { 
    type: Number, 
    required: true 
  },
  imageUrl: { 
    type: String 
  },
  rating: { 
    type: Number, 
    min: 1, 
    max: 5, 
    default: 4 
  },
  languages: { 
    type: [String], 
    default: ['English'] 
  },
  specializations: { 
    type: [String], 
    default: [] 
  },
  status: { 
    type: String, 
    enum: ['available', 'on_duty', 'on_leave', 'inactive'],
    default: 'available'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Add index for faster queries
driverSchema.index({ status: 1 });
driverSchema.index({ rating: 1 });

const Driver = mongoose.model('Driver', driverSchema);
export default Driver;
