import express from 'express';
import { isAuthenticated } from '../middleware/auth.js';
import * as profileController from '../controllers/profile.controller.js';

const router = express.Router();

// Get vehicles registered by the logged-in user
router.get('/my-vehicles', isAuthenticated, profileController.getMyVehicles);

export default router;
