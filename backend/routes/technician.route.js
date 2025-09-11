import express from 'express';
import { isAuthenticated, authorizeRoles } from '../middleware/auth.js';
import { upload } from '../middleware/fileUpload.js';
import {
    createTechnician,
    getAllTechnicians,
    getTechnicianById,
    updateTechnicianStatus,
    updateTechnician,
    deleteTechnician,
    getTechnicianProfile,
    updateTechnicianAvailability
} from '../controllers/technician.controller.js';

const router = express.Router();

// Admin routes
router.post(
    '/', 
    isAuthenticated, 
    authorizeRoles('admin'), 
    upload.single('certificateImage'), 
    createTechnician
);

router.get(
    '/', 
    isAuthenticated, 
    authorizeRoles('admin'), 
    getAllTechnicians
);

router.get(
    '/:id', 
    isAuthenticated, 
    authorizeRoles('admin'), 
    getTechnicianById
);

router.patch(
    '/status/:id', 
    isAuthenticated, 
    authorizeRoles('admin'), 
    updateTechnicianStatus
);

router.put(
    '/:id', 
    isAuthenticated, 
    authorizeRoles('admin'), 
    upload.single('certificateImage'), 
    updateTechnician
);

router.delete(
    '/:id', 
    isAuthenticated, 
    authorizeRoles('admin'), 
    deleteTechnician
);

// Technician routes
router.get(
    '/profile/me', 
    isAuthenticated, 
    authorizeRoles('technician'), 
    getTechnicianProfile
);

router.patch(
    '/availability/:id', 
    isAuthenticated, 
    authorizeRoles('technician'), 
    updateTechnicianAvailability
);

export default router;
