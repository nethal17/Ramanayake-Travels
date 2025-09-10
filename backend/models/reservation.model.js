import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  vehicleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vehicle', 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  pickupDate: { 
    type: Date, 
    required: true 
  },
  returnDate: { 
    type: Date, 
    required: true 
  },
  driverRequired: { 
    type: Boolean, 
    default: false 
  },
  driverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Driver' 
  },
  totalPrice: { 
    type: Number, 
    required: true 
  },
  basePrice: { 
    type: Number, 
    required: true 
  },
  driverPrice: { 
    type: Number, 
    default: 0 
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partially_paid', 'paid'],
    default: 'unpaid'
  },
  notes: { 
    type: String 
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
reservationSchema.index({ userId: 1, status: 1 });
reservationSchema.index({ vehicleId: 1, status: 1 });
reservationSchema.index({ pickupDate: 1, returnDate: 1 });

const Reservation = mongoose.model('Reservation', reservationSchema);
export default Reservation;
