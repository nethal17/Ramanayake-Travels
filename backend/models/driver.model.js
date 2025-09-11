import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    age: {
        type: Number,
        required: [true, "Age is required"],
        min: [18, "Driver must be at least 18 years old"],
        max: [70, "Driver must be under 70 years old"]
    },
    address: {
        type: String,
        required: [true, "Address is required"],
        trim: true
    },
    drivingLicense: {
        frontImage: {
            type: String,
            required: [true, "Front image of driving license is required"]
        },
        backImage: {
            type: String,
            required: [true, "Back image of driving license is required"]
        },
        licenseNumber: {
            type: String,
            trim: true
        },
        expiryDate: {
            type: Date
        }
    },
    status: {
        type: String,
        enum: ["active", "suspended"],
        default: "active"
    },
    yearsOfExperience: {
        type: Number,
        min: 0,
        default: 0
    },
    assignedVehicles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle'
    }],
    currentLocation: {
        latitude: Number,
        longitude: Number,
        lastUpdated: { type: Date, default: Date.now }
    },
    availability: {
        type: Boolean,
        default: true
    },
    dailyRate: {
        type: Number,
        default: 2500,
        min: 1000
    }
}, {
    timestamps: true
});

// Create compound index for efficient queries
driverSchema.index({ status: 1, availability: 1 });

const Driver = mongoose.model("Driver", driverSchema);

export default Driver;
