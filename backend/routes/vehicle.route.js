import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';
import * as vehicleController from '../controllers/vehicle.controller.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Public routes
router.get('/', vehicleController.getAllAvailableVehicles); 
router.get('/search', vehicleController.searchVehicles); 
router.get('/:id', vehicleController.getVehicleById);

// Authenticated user routes
router.post('/register', isAuthenticated, upload.single('image'), vehicleController.registerVehicle);

// Admin routes
router.post('/', isAuthenticated, isAdmin, vehicleController.createVehicle);
router.get('/admin/all', isAuthenticated, isAdmin, vehicleController.getAllVehicles); 
router.get('/admin/company', isAuthenticated, isAdmin, vehicleController.getCompanyVehicles); 
router.get('/admin/customer', isAuthenticated, isAdmin, vehicleController.getCustomerVehicles); 
router.put('/:id', isAuthenticated, isAdmin, vehicleController.updateVehicle);
router.delete('/:id', isAuthenticated, isAdmin, vehicleController.deleteVehicle);

// Vehicle application routes 
router.get('/admin/applications', isAuthenticated, isAdmin, vehicleController.getAllVehicleApplications);
router.get('/admin/applications/:id', isAuthenticated, isAdmin, vehicleController.getVehicleApplicationById);
router.put('/admin/applications/:id/approve', isAuthenticated, isAdmin, vehicleController.approveVehicleApplication);
router.put('/admin/applications/:id/reject', isAuthenticated, isAdmin, vehicleController.rejectVehicleApplication);

export default router;
