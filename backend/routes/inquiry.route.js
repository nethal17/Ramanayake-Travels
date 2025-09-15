import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
    createInquiry,
    getDriverInquiries,
    getInquiryById,
    getAllInquiries,
    updateInquiry,
    deleteInquiry
} from '../controllers/inquiry.controller.js';
import { isAuthenticated, isAdmin, isDriver } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/inquiries/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'inquiry-' + uniqueSuffix + path.extname(file.originalname));
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

// Driver routes - Submit and view their own inquiries
router.post('/create', isAuthenticated, isDriver, upload.array('images', 5), createInquiry);
router.get('/driver', isAuthenticated, isDriver, getDriverInquiries);
router.get('/driver/:id', isAuthenticated, isDriver, getInquiryById);

// Admin routes - View and manage all inquiries
router.get('/admin', isAuthenticated, isAdmin, getAllInquiries);
router.put('/:id', isAuthenticated, isAdmin, updateInquiry);

// Delete route - Both admin and the driver who created the inquiry can delete it
router.delete('/:id', isAuthenticated, deleteInquiry);

export default router;
