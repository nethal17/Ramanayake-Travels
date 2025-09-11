import Maintenance from '../models/maintenance.model.js';
import Vehicle from '../models/vehicle.model.js';
import Technician from '../models/technician.model.js';
import fs from 'fs';
import path from 'path';

// Create maintenance record
export const createMaintenance = async (req, res) => {
    try {
        const { 
            vehicleId, 
            scheduledDate, 
            maintenanceType, 
            description,
            cost,
            technicianId
        } = req.body;

        // Validate vehicle exists
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found"
            });
        }

        // Validate technician exists if one is assigned
        if (technicianId) {
            const technician = await Technician.findById(technicianId);
            if (!technician) {
                return res.status(404).json({
                    success: false,
                    message: "Technician not found"
                });
            }
        }

        // Create maintenance record
        const maintenance = new Maintenance({
            vehicleId: vehicleId,
            scheduledDate: new Date(scheduledDate),
            maintenanceType,
            description,
            cost: cost ? parseFloat(cost) : 0,
            technicianId: technicianId || null,
            assignedTechnician: technicianId || null,
            status: technicianId ? 'in-progress' : 'scheduled'
        });

        await maintenance.save();

        res.status(201).json({
            success: true,
            message: "Maintenance record created successfully",
            data: maintenance
        });

    } catch (error) {
        console.error('Create maintenance error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to create maintenance record",
            error: error.message
        });
    }
};

// Get all maintenance records
export const getAllMaintenance = async (req, res) => {
    try {
        const { status, vehicleId, technicianId, startDate, endDate } = req.query;

        // Build query based on filters
        const query = {};

        if (status) query.status = status;
        if (vehicleId) query.vehicleId = vehicleId;
        if (technicianId) query.technicianId = technicianId;

        // Date range filter
        if (startDate || endDate) {
            query.scheduledDate = {};
            if (startDate) query.scheduledDate.$gte = new Date(startDate);
            if (endDate) query.scheduledDate.$lte = new Date(endDate);
        }

        const maintenance = await Maintenance.find(query)
            .populate('vehicleId', 'registrationNumber make model year')
            .populate({
                path: 'technicianId',
                populate: {
                    path: 'userId',
                    select: 'name'
                }
            })
            .sort({ scheduledDate: -1 });

        res.status(200).json({
            success: true,
            count: maintenance.length,
            data: maintenance
        });
    } catch (error) {
        console.error('Get maintenance records error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch maintenance records",
            error: error.message
        });
    }
};

// Get maintenance by ID
export const getMaintenanceById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const maintenance = await Maintenance.findById(id)
            .populate('vehicleId', 'registrationNumber make model year')
            .populate({
                path: 'technicianId',
                populate: {
                    path: 'userId',
                    select: 'name email phone'
                }
            });

        if (!maintenance) {
            return res.status(404).json({
                success: false,
                message: "Maintenance record not found"
            });
        }

        res.status(200).json({
            success: true,
            data: maintenance
        });
    } catch (error) {
        console.error('Get maintenance error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch maintenance record",
            error: error.message
        });
    }
};

// Update maintenance record (Admin function)
export const updateMaintenance = async (req, res) => {
    try {
        console.log('Update maintenance request body:', req.body);
        
        const { id } = req.params;
        const { 
            vehicleId, 
            scheduledDate, 
            maintenanceType, 
            description,
            cost,
            technicianId,
            status
        } = req.body;

        // Check if maintenance record exists
        const maintenance = await Maintenance.findById(id);
        if (!maintenance) {
            return res.status(404).json({
                success: false,
                message: "Maintenance record not found"
            });
        }

        // Validate vehicle exists if changing
        if (vehicleId && vehicleId !== maintenance.vehicleId.toString()) {
            const vehicle = await Vehicle.findById(vehicleId);
            if (!vehicle) {
                return res.status(404).json({
                    success: false,
                    message: "Vehicle not found"
                });
            }
        }

        // Validate technician exists if changing
        if (technicianId && technicianId !== (maintenance.technicianId ? maintenance.technicianId.toString() : null)) {
            const technician = await Technician.findById(technicianId);
            if (!technician) {
                return res.status(404).json({
                    success: false,
                    message: "Technician not found"
                });
            }
        }

        // Prepare update data
        const updateData = {
            vehicleId: vehicleId || maintenance.vehicleId,
            scheduledDate: scheduledDate ? new Date(scheduledDate) : maintenance.scheduledDate,
            maintenanceType: maintenanceType || maintenance.maintenanceType,
            description: description || maintenance.description,
            cost: cost !== undefined ? parseFloat(cost) : maintenance.cost
        };

        // Update technician assignment
        if (technicianId !== undefined) {
            updateData.technicianId = technicianId || null;
            
            // If we're assigning a technician for the first time, update status
            if (technicianId && !maintenance.technicianId && maintenance.status === 'scheduled') {
                updateData.status = 'in-progress';
            }
            
            // If we're removing a technician, update status to scheduled
            if (!technicianId && maintenance.technicianId) {
                updateData.status = 'scheduled';
            }
        }

        // Update status if provided
        if (status) {
            updateData.status = status;
            
            // If status is completed, set completion date
            if (status === 'completed' && maintenance.status !== 'completed') {
                updateData.completionDate = new Date();
            }
        }

        const updatedMaintenance = await Maintenance.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
        .populate('vehicleId', 'registrationNumber make model year')
        .populate({
            path: 'technicianId',
            populate: {
                path: 'userId',
                select: 'name'
            }
        });

        res.status(200).json({
            success: true,
            message: "Maintenance record updated successfully",
            data: updatedMaintenance
        });

    } catch (error) {
        console.error('Update maintenance error:', error);
        
        // Specific error handling for validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            
            // Extract validation error messages
            for (let field in error.errors) {
                validationErrors[field] = error.errors[field].message;
            }
            
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: validationErrors,
                error: error.message
            });
        }
        
        // Handling CastError (invalid ObjectId)
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid ID format",
                error: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Failed to update maintenance record",
            error: error.message
        });
    }
};

// Delete maintenance record
export const deleteMaintenance = async (req, res) => {
    try {
        const { id } = req.params;

        const maintenance = await Maintenance.findById(id);
        if (!maintenance) {
            return res.status(404).json({
                success: false,
                message: "Maintenance record not found"
            });
        }

        // Delete any attached files
        if (maintenance.reportDetails && maintenance.reportDetails.attachments && maintenance.reportDetails.attachments.length > 0) {
            for (const file of maintenance.reportDetails.attachments) {
                const filePath = path.join(process.cwd(), 'uploads', file);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        }

        // Delete bill image if it exists
        if (maintenance.billImage) {
            const filePath = path.join(process.cwd(), 'uploads', maintenance.billImage);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await Maintenance.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Maintenance record deleted successfully"
        });
    } catch (error) {
        console.error('Delete maintenance error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to delete maintenance record",
            error: error.message
        });
    }
};

// Get maintenance records for a technician (technician dashboard)
export const getTechnicianMaintenance = async (req, res) => {
    try {
        // Get the logged-in technician's ID
        const userId = req.user._id;
        
        // Find technician record
        const technician = await Technician.findOne({ userId });
        if (!technician) {
            return res.status(404).json({
                success: false,
                message: "Technician profile not found"
            });
        }
        
        const { status } = req.query;
        
        // Build query
        const query = { assignedTechnician: technician._id };
        if (status) query.status = status;
        
        // Get maintenance records assigned to this technician
        const maintenance = await Maintenance.find(query)
            .populate('vehicleId', 'registrationNumber make model year')
            .sort({ scheduledDate: 1 });
            
        console.log(`Found ${maintenance.length} maintenance records for technician ${technician._id}`);
            
        res.status(200).json({
            success: true,
            count: maintenance.length,
            data: maintenance
        });
    } catch (error) {
        console.error('Get technician maintenance error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch technician's maintenance records",
            error: error.message
        });
    }
};

// Update maintenance status, costs and notes (by technician)
export const updateMaintenanceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            status, 
            actualCost, 
            notes, 
            partsCost, 
            laborCost,
            additionalCosts,
            reportText
        } = req.body;
        
        console.log('Technician updating maintenance:', {
            id,
            status,
            actualCost,
            partsCost,
            laborCost,
            additionalCosts
        });
        
        // Check if maintenance record exists
        const maintenance = await Maintenance.findById(id);
        if (!maintenance) {
            return res.status(404).json({
                success: false,
                message: "Maintenance record not found"
            });
        }
        
        // Get the logged-in technician's ID
        const userId = req.user._id;
        
        // Find technician record
        const technician = await Technician.findOne({ userId });
        if (!technician) {
            return res.status(404).json({
                success: false,
                message: "Technician profile not found"
            });
        }
        
        // Verify this maintenance is assigned to this technician
        if (maintenance.assignedTechnician.toString() !== technician._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this maintenance record"
            });
        }
        
        // Prepare update data
        const updateData = {};
        
        if (status) {
            updateData.status = status;
            
            // If status is completed, set completion date
            if (status === 'completed' && maintenance.status !== 'completed') {
                updateData.completionDate = new Date();
                console.log('Setting completion date:', updateData.completionDate);
            }
        }
        
        if (notes) updateData.notes = notes;
        if (reportText) updateData.reportText = reportText;
        
        // Update costs if provided - ensure proper number conversion
        if (actualCost !== undefined && actualCost !== '') 
            updateData.actualCost = parseFloat(actualCost) || 0;
        if (partsCost !== undefined && partsCost !== '') 
            updateData.partsCost = parseFloat(partsCost) || 0;
        if (laborCost !== undefined && laborCost !== '') 
            updateData.laborCost = parseFloat(laborCost) || 0;
        if (additionalCosts !== undefined && additionalCosts !== '') 
            updateData.additionalCosts = parseFloat(additionalCosts) || 0;
        
        console.log('Update data prepared:', updateData);
        
        // Handle bill files upload
        if (req.files && req.files.billFiles) {
            const billFiles = Array.isArray(req.files.billFiles) 
                ? req.files.billFiles 
                : [req.files.billFiles];
                
            console.log('Processing bill files:', billFiles.length);
                
            // Add new bill files to the existing ones
            updateData.billFiles = [
                ...(maintenance.billFiles || []),
                ...billFiles.map(file => file.filename)
            ];
        }
        
        // Handle report files upload
        if (req.files && req.files.reportFiles) {
            const reportFiles = Array.isArray(req.files.reportFiles) 
                ? req.files.reportFiles 
                : [req.files.reportFiles];
                
            console.log('Processing report files:', reportFiles.length);
                
            // Add new report files to the existing ones
            updateData.reportFiles = [
                ...(maintenance.reportFiles || []),
                ...reportFiles.map(file => file.filename)
            ];
        }
        
        console.log('Final update data:', updateData);
        
        const updatedMaintenance = await Maintenance.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
        .populate('vehicleId', 'registrationNumber make model year');
        
        console.log('Maintenance updated successfully:', updatedMaintenance._id);
        
        res.status(200).json({
            success: true,
            message: "Maintenance record updated successfully",
            data: updatedMaintenance
        });
        
    } catch (error) {
        console.error('Update maintenance status error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to update maintenance status",
            error: error.message
        });
    }
};

// Delete a bill or report file
export const deleteMaintenanceFile = async (req, res) => {
    try {
        const { id } = req.params;
        const { fileType, fileName } = req.body;
        
        if (!fileType || !fileName) {
            return res.status(400).json({
                success: false,
                message: "File type and file name are required"
            });
        }
        
        if (fileType !== 'bill' && fileType !== 'report') {
            return res.status(400).json({
                success: false,
                message: "File type must be 'bill' or 'report'"
            });
        }
        
        // Check if maintenance record exists
        const maintenance = await Maintenance.findById(id);
        if (!maintenance) {
            return res.status(404).json({
                success: false,
                message: "Maintenance record not found"
            });
        }
        
        // Get the logged-in technician's ID
        const userId = req.user._id;
        
        // Find technician record
        const technician = await Technician.findOne({ userId });
        if (!technician) {
            return res.status(404).json({
                success: false,
                message: "Technician profile not found"
            });
        }
        
        // Verify this maintenance is assigned to this technician
        if (maintenance.assignedTechnician.toString() !== technician._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this maintenance record"
            });
        }
        
        // Get the file array based on type
        const fileArray = fileType === 'bill' ? maintenance.billFiles : maintenance.reportFiles;
        
        // Check if file exists
        if (!fileArray || !fileArray.includes(fileName)) {
            return res.status(404).json({
                success: false,
                message: `${fileType} file not found`
            });
        }
        
        // Delete file from filesystem
        const filePath = path.join(process.cwd(), 'uploads', fileName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        // Remove file from array
        const updatedFileArray = fileArray.filter(file => file !== fileName);
        
        // Update maintenance record
        const updateData = {};
        if (fileType === 'bill') {
            updateData.billFiles = updatedFileArray;
        } else {
            updateData.reportFiles = updatedFileArray;
        }
        
        const updatedMaintenance = await Maintenance.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
        
        res.status(200).json({
            success: true,
            message: `${fileType} file deleted successfully`,
            data: updatedMaintenance
        });
        
    } catch (error) {
        console.error('Delete maintenance file error:', error);
        res.status(500).json({
            success: false,
            message: `Failed to delete ${req.body.fileType} file`,
            error: error.message
        });
    }
};
