import Inquiry from '../models/inquiry.model.js';
import Driver from '../models/driver.model.js';

// Create a new inquiry
export const createInquiry = async (req, res) => {
    try {
        const { type, subject, description, location, tripId, vehicleId, priority } = req.body;
        const userId = req.user._id;
        
        // Find the driver associated with this user
        const driver = await Driver.findOne({ userId });
        
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Driver profile not found"
            });
        }
        
        // Handle image uploads if any
        const images = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                images.push(file.filename);
            });
        }
        
        const inquiry = new Inquiry({
            driverId: driver._id,
            userId,
            type,
            subject,
            description,
            location: location || "",
            tripId: tripId || null,
            vehicleId: vehicleId || null,
            priority: priority || "medium",
            images
        });
        
        await inquiry.save();
        
        res.status(201).json({
            success: true,
            message: "Inquiry submitted successfully",
            data: inquiry
        });
    } catch (error) {
        console.error("Error creating inquiry:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit inquiry",
            error: error.message
        });
    }
};

// Get all inquiries for a driver
export const getDriverInquiries = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Find the driver associated with this user
        const driver = await Driver.findOne({ userId });
        
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Driver profile not found"
            });
        }
        
        const inquiries = await Inquiry.find({ driverId: driver._id })
            .sort({ createdAt: -1 })
            .populate('vehicleId', 'make model registrationNumber')
            .populate('tripId', 'pickupDate dropoffDate pickupLocation dropoffLocation');
        
        res.status(200).json({
            success: true,
            data: inquiries
        });
    } catch (error) {
        console.error("Error fetching driver inquiries:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch inquiries",
            error: error.message
        });
    }
};

// Get a specific inquiry by ID
export const getInquiryById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        
        // Find the driver associated with this user
        const driver = await Driver.findOne({ userId });
        
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Driver profile not found"
            });
        }
        
        const inquiry = await Inquiry.findOne({ 
            _id: id,
            driverId: driver._id
        })
        .populate('vehicleId', 'make model registrationNumber')
        .populate('tripId', 'pickupDate dropoffDate pickupLocation dropoffLocation');
        
        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: "Inquiry not found"
            });
        }
        
        res.status(200).json({
            success: true,
            data: inquiry
        });
    } catch (error) {
        console.error("Error fetching inquiry:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch inquiry",
            error: error.message
        });
    }
};

// Admin: Get all inquiries
export const getAllInquiries = async (req, res) => {
    try {
        const { status, type, priority } = req.query;
        
        const filter = {};
        if (status) filter.status = status;
        if (type) filter.type = type;
        if (priority) filter.priority = priority;
        
        const inquiries = await Inquiry.find(filter)
            .sort({ createdAt: -1 })
            .populate('driverId', '')
            .populate({
                path: 'driverId',
                populate: {
                    path: 'userId',
                    select: 'name email phone'
                }
            })
            .populate('vehicleId', 'make model registrationNumber')
            .populate('tripId', 'pickupDate dropoffDate pickupLocation dropoffLocation');
        
        res.status(200).json({
            success: true,
            data: inquiries
        });
    } catch (error) {
        console.error("Error fetching all inquiries:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch inquiries",
            error: error.message
        });
    }
};

// Admin: Update inquiry status and add response
export const updateInquiry = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminResponse, priority } = req.body;
        
        const updateData = {};
        if (status) {
            updateData.status = status;
            // If status is being set to resolved, set resolvedAt timestamp
            if (status === 'resolved') {
                updateData.resolvedAt = new Date();
            } else {
                // If status is changed from resolved to something else
                updateData.resolvedAt = null;
            }
        }
        if (adminResponse) updateData.adminResponse = adminResponse;
        if (priority) updateData.priority = priority;
        
        const inquiry = await Inquiry.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
        .populate('driverId', '')
        .populate({
            path: 'driverId',
            populate: {
                path: 'userId',
                select: 'name email phone'
            }
        })
        .populate('vehicleId', 'make model registrationNumber')
        .populate('tripId', 'pickupDate dropoffDate pickupLocation dropoffLocation');
        
        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: "Inquiry not found"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Inquiry updated successfully",
            data: inquiry
        });
    } catch (error) {
        console.error("Error updating inquiry:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update inquiry",
            error: error.message
        });
    }
};

// Delete an inquiry
export const deleteInquiry = async (req, res) => {
    try {
        const { id } = req.params;
        
        // For admin or for the driver who created it
        let filter = { _id: id };
        
        // If not admin, only allow deleting their own inquiries
        if (req.user.role !== 'admin') {
            const driver = await Driver.findOne({ userId: req.user._id });
            if (!driver) {
                return res.status(404).json({
                    success: false,
                    message: "Driver profile not found"
                });
            }
            filter.driverId = driver._id;
        }
        
        const inquiry = await Inquiry.findOneAndDelete(filter);
        
        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: "Inquiry not found or you don't have permission to delete it"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Inquiry deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting inquiry:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete inquiry",
            error: error.message
        });
    }
};
