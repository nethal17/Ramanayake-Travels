import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema({
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    technicianId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Technician'
    },
    assignedTechnician: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Technician'
    },
    maintenanceType: {
        type: String,
        required: true,
        enum: ['Regular', 'Regular Service', 'Repair', 'Inspection', 'Tire Change', 'Oil Change', 'Major Overhaul']
    },
    description: {
        type: String,
        required: true
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    completionDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    cost: {
        type: Number,
        min: 0,
        default: 0
    },
    // Added fields for technician maintenance updates
    actualCost: {
        type: Number,
        min: 0,
        default: 0
    },
    partsCost: {
        type: Number,
        min: 0,
        default: 0
    },
    laborCost: {
        type: Number,
        min: 0,
        default: 0
    },
    additionalCosts: {
        type: Number,
        min: 0,
        default: 0
    },
    reportText: {
        type: String
    },
    billFiles: [{
        type: String
    }],
    reportFiles: [{
        type: String
    }],
    parts: [{
        name: {
            type: String
        },
        quantity: {
            type: Number,
            min: 1
        },
        cost: {
            type: Number,
            min: 0
        }
    }],
    billImage: {
        type: String
    },
    notes: {
        type: String
    },
    reportDetails: {
        findings: {
            type: String
        },
        workDone: {
            type: String
        },
        recommendations: {
            type: String
        },
        attachments: [{
            type: String
        }]
    },
    // createdBy field removed
}, {
    timestamps: true
});

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);

export default Maintenance;
