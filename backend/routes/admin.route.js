import express from 'express';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';
import * as vehicleController from '../controllers/vehicle.controller.js';

const router = express.Router();

// Get all vehicle applications (admin only)
router.get('/admin/vehicles', isAuthenticated, isAdmin, vehicleController.getAllVehicleApplications);

// Update vehicle application status (admin only)
router.put('/admin/vehicles/:id/approve', isAuthenticated, isAdmin, vehicleController.approveVehicleApplication);
router.put('/admin/vehicles/:id/reject', isAuthenticated, isAdmin, vehicleController.rejectVehicleApplication);

// Get single vehicle application details (admin only)
router.get('/admin/vehicles/:id', isAuthenticated, isAdmin, vehicleController.getVehicleApplicationById);

export default router;
