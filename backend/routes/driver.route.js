import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
    createDriver, 
    getAllDrivers, 
    getDriverById, 
    updateDriver,
    updateDriverStatus, 
    deleteDriver,
    getDriverProfile,
    updateDriverAvailability
} from '../controllers/driver.controller.js';
import { isAuthenticated, isAdmin, isDriver } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 
    }
});

// Driver profile routes - these come first to take precedence
router.get('/profile', isAuthenticated, isDriver, getDriverProfile);
router.put('/availability', isAuthenticated, isDriver, updateDriverAvailability);

// Admin routes - only accessible to admins
router.post('/create', isAuthenticated, isAdmin, upload.fields([
    { name: 'frontLicense', maxCount: 1 },
    { name: 'backLicense', maxCount: 1 }
]), createDriver);

router.get('/list', isAuthenticated, isAdmin, getAllDrivers);
router.get('/:id', isAuthenticated, isAdmin, getDriverById);
router.put('/:id', isAuthenticated, isAdmin, upload.fields([
    { name: 'frontLicense', maxCount: 1 },
    { name: 'backLicense', maxCount: 1 }
]), updateDriver);
router.put('/:id/status', isAuthenticated, isAdmin, updateDriverStatus);
router.delete('/:id', isAuthenticated, isAdmin, deleteDriver);

export default router;
