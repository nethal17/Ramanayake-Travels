import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
    createDriver, 
    getAllDrivers, 
    getDriverById, 
    updateDriver,
    updateDriverStatus, 
    deleteDriver 
} from '../controllers/driver.controller.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';

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
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// All routes require authentication and admin role
router.use(isAuthenticated);
router.use(isAdmin);

// Driver routes
router.post('/create', upload.fields([
    { name: 'frontLicense', maxCount: 1 },
    { name: 'backLicense', maxCount: 1 }
]), createDriver);

router.get('/list', getAllDrivers);
router.get('/:id', getDriverById);
router.put('/:id', upload.fields([
    { name: 'frontLicense', maxCount: 1 },
    { name: 'backLicense', maxCount: 1 }
]), updateDriver);
router.put('/:id/status', updateDriverStatus);
router.delete('/:id', deleteDriver);

export default router;
