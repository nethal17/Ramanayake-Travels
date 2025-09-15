import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema({
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ["breakdown", "complaint", "other"],
        required: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation',
        default: null
    },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        default: null
    },
    status: {
        type: String,
        enum: ["pending", "in-progress", "resolved"],
        default: "pending"
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high", "urgent"],
        default: "medium"
    },
    images: [{
        type: String
    }],
    adminResponse: {
        type: String,
        default: ""
    },
    resolvedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

const Inquiry = mongoose.model("Inquiry", inquirySchema);

export default Inquiry;
