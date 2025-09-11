import mongoose from 'mongoose';

const technicianSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    age: {
        type: Number,
        required: true,
        min: 18,
        max: 70
    },
    address: {
        type: String,
        required: true
    },
    specialization: {
        type: String,
        required: true,
        enum: ['Engine', 'Electrical', 'Body Work', 'General', 'AC Repair', 'Tire & Suspension']
    },
    experience: {
        type: Number,
        required: true,
        min: 0
    },
    certification: {
        certName: {
            type: String,
            required: true
        },
        issueDate: {
            type: Date,
            required: true
        },
        expiryDate: {
            type: Date
        },
        certificateImage: {
            type: String,
            required: true
        }
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    availability: {
        type: Boolean,
        default: true
    },
    completedMaintenance: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    }
}, {
    timestamps: true
});

const Technician = mongoose.model('Technician', technicianSchema);

export default Technician;
