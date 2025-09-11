import express from 'express';
import { isAuthenticated, isAdmin, isDriver } from '../middleware/auth.js';
import * as reservationController from '../controllers/reservation.controller.js';

const router = express.Router();

// Public routes
router.get('/drivers', reservationController.getAllDrivers);
router.get('/check-availability', reservationController.checkVehicleAvailability);

// Authenticated user routes
router.post('/', isAuthenticated, reservationController.createReservation);
router.get('/user', isAuthenticated, reservationController.getUserReservations);
router.put('/:reservationId/cancel', isAuthenticated, reservationController.cancelReservation);

// Driver routes
router.get('/driver', isAuthenticated, isDriver, reservationController.getDriverReservations);
router.put('/:reservationId/trip-status', isAuthenticated, isDriver, reservationController.updateTripStatus);

// Admin routes
router.get('/', isAuthenticated, isAdmin, reservationController.getAllReservations);
router.put('/:reservationId/status', isAuthenticated, isAdmin, reservationController.updateReservationStatus);

export default router;
