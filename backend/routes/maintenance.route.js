import express from 'express';
import { isAuthenticated, authorizeRoles } from '../middleware/auth.js';
import { upload } from '../middleware/fileUpload.js';
import {
    createMaintenance,
    getAllMaintenance,
    getMaintenanceById,
    updateMaintenance,
    deleteMaintenance,
    getTechnicianMaintenance,
    updateMaintenanceStatus,
    deleteMaintenanceFile
} from '../controllers/maintenance.controller.js';

const router = express.Router();

// Set up multer for multiple file uploads
const maintenanceUpload = upload.fields([
    { name: 'billFiles', maxCount: 5 },
    { name: 'reportFiles', maxCount: 5 }
]);

// Admin routes
router.post(
    '/', 
    isAuthenticated, 
    authorizeRoles('admin'), 
    createMaintenance
);

router.get(
    '/', 
    isAuthenticated, 
    authorizeRoles('admin', 'technician'), 
    getAllMaintenance
);

router.get(
    '/:id', 
    isAuthenticated, 
    authorizeRoles('admin', 'technician'), 
    getMaintenanceById
);

router.put(
    '/:id', 
    isAuthenticated, 
    authorizeRoles('admin'), 
    updateMaintenance
);

router.delete(
    '/:id', 
    isAuthenticated, 
    authorizeRoles('admin'), 
    deleteMaintenance
);

// Technician routes
router.get(
    '/technician/assignments', 
    isAuthenticated, 
    authorizeRoles('technician'), 
    getTechnicianMaintenance
);

router.patch(
    '/technician/update/:id', 
    isAuthenticated, 
    authorizeRoles('technician'), 
    maintenanceUpload, 
    updateMaintenanceStatus
);

router.delete(
    '/technician/file/:id', 
    isAuthenticated, 
    authorizeRoles('technician'), 
    deleteMaintenanceFile
);

export default router;
