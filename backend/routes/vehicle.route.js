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

// Vehicle application routes
router.post('/register', isAuthenticated, upload.single('image'), vehicleController.registerVehicle);

// Public vehicle routes
router.get('/', vehicleController.getAllAvailableVehicles); // Modified to be public
router.get('/search', vehicleController.searchVehicles); // Added from fleet routes

// Admin direct vehicle management routes
router.post('/', isAuthenticated, isAdmin, vehicleController.createVehicle);
router.get('/admin/all', isAuthenticated, isAdmin, vehicleController.getAllVehicles); // Route changed to avoid conflict
router.get('/admin/company', isAuthenticated, isAdmin, vehicleController.getCompanyVehicles); // Added from fleet routes
router.get('/admin/customer', isAuthenticated, isAdmin, vehicleController.getCustomerVehicles); // Added from fleet routes
router.get('/:id', vehicleController.getVehicleById); // Made public
router.put('/:id', isAuthenticated, isAdmin, vehicleController.updateVehicle);
router.delete('/:id', isAuthenticated, isAdmin, vehicleController.deleteVehicle);

export default router;
