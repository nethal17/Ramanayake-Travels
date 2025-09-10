import Reservation from '../models/reservation.model.js';
import Vehicle from '../models/vehicle.model.js';
import Driver from '../models/driver.model.js';
import { differenceInDays } from 'date-fns';

// Create a new reservation
export async function createReservation(req, res) {
  try {
    const { 
      vehicleId, 
      pickupDate, 
      returnDate, 
      driverRequired, 
      driverId, 
      notes 
    } = req.body;

    // Verify user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'You must be logged in to make a reservation' });
    }

    // Check if vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check if vehicle is available
    if (vehicle.status !== 'available') {
      return res.status(400).json({ message: 'Vehicle is not available for reservation' });
    }

    // Convert string dates to Date objects
    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);

    // Validate dates
    if (pickup < new Date()) {
      return res.status(400).json({ message: 'Pickup date cannot be in the past' });
    }

    if (returnD <= pickup) {
      return res.status(400).json({ message: 'Return date must be after pickup date' });
    }

    // Check for conflicts with existing reservations
    const existingReservations = await Reservation.find({
      vehicleId: vehicleId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        // New reservation starts during an existing reservation
        { pickupDate: { $lte: returnD }, returnDate: { $gte: pickup } },
        // New reservation ends during an existing reservation
        { pickupDate: { $lte: returnD }, returnDate: { $gte: pickup } }
      ]
    });

    if (existingReservations.length > 0) {
      return res.status(400).json({ message: 'Vehicle is already reserved for these dates' });
    }

    // Calculate number of days
    const days = Math.max(1, differenceInDays(returnD, pickup));

    // Calculate base price
    const basePrice = vehicle.price * days;

    let driver = null;
    let driverPrice = 0;

    // If driver is required, verify driver exists and calculate driver price
    if (driverRequired && driverId) {
      driver = await Driver.findById(driverId);
      if (!driver) {
        return res.status(404).json({ message: 'Driver not found' });
      }

      if (driver.status !== 'available') {
        return res.status(400).json({ message: 'Selected driver is not available' });
      }

      driverPrice = driver.dailyRate * days;
    }

    // Calculate total price
    const totalPrice = basePrice + driverPrice;

    // Create reservation
    const reservation = new Reservation({
      vehicleId,
      userId: req.user._id,
      pickupDate: pickup,
      returnDate: returnD,
      driverRequired,
      driverId: driver ? driver._id : null,
      totalPrice,
      basePrice,
      driverPrice,
      status: 'pending',
      notes
    });

    await reservation.save();

    // Return the reservation with populated vehicle and driver details
    const populatedReservation = await Reservation.findById(reservation._id)
      .populate('vehicleId')
      .populate('driverId');

    res.status(201).json({
      message: 'Reservation created successfully',
      reservation: populatedReservation
    });
  } catch (err) {
    console.error('Error creating reservation:', err);
    res.status(500).json({ message: 'Failed to create reservation', error: err.message });
  }
}

// Get all drivers
export async function getAllDrivers(req, res) {
  try {
    const drivers = await Driver.find({ status: 'available' });
    res.status(200).json(drivers);
  } catch (err) {
    console.error('Error fetching drivers:', err);
    res.status(500).json({ message: 'Failed to fetch drivers', error: err.message });
  }
}

// Check vehicle availability
export async function checkVehicleAvailability(req, res) {
  try {
    const { vehicleId, pickupDate, returnDate } = req.query;

    if (!vehicleId || !pickupDate || !returnDate) {
      return res.status(400).json({ message: 'Vehicle ID, pickup date, and return date are required' });
    }

    // Convert string dates to Date objects
    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);

    // Find vehicle
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check if vehicle is available in general
    if (vehicle.status !== 'available') {
      return res.status(200).json({ available: false, message: 'Vehicle is not available for booking' });
    }

    // Check for conflicts with existing reservations
    const existingReservations = await Reservation.find({
      vehicleId: vehicleId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        // New reservation starts during an existing reservation
        { pickupDate: { $lte: returnD }, returnDate: { $gte: pickup } },
        // New reservation ends during an existing reservation
        { pickupDate: { $lte: returnD }, returnDate: { $gte: pickup } }
      ]
    });

    if (existingReservations.length > 0) {
      return res.status(200).json({ 
        available: false, 
        message: 'Vehicle is already reserved for these dates',
        conflictingReservations: existingReservations
      });
    }

    // Calculate number of days
    const days = Math.max(1, differenceInDays(returnD, pickup));

    // Calculate base price
    const basePrice = vehicle.price * days;

    res.status(200).json({
      available: true,
      message: 'Vehicle is available for the selected dates',
      basePrice,
      days
    });

  } catch (err) {
    console.error('Error checking vehicle availability:', err);
    res.status(500).json({ message: 'Failed to check availability', error: err.message });
  }
}

// Get user reservations
export async function getUserReservations(req, res) {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'You must be logged in to view your reservations' });
    }

    const reservations = await Reservation.find({ userId: req.user._id })
      .populate('vehicleId')
      .populate('driverId')
      .sort({ createdAt: -1 });

    res.status(200).json(reservations);
  } catch (err) {
    console.error('Error fetching user reservations:', err);
    res.status(500).json({ message: 'Failed to fetch reservations', error: err.message });
  }
}

// Get all reservations (admin only)
export async function getAllReservations(req, res) {
  try {
    const reservations = await Reservation.find()
      .populate('vehicleId')
      .populate('userId', 'name email')
      .populate('driverId')
      .sort({ createdAt: -1 });

    res.status(200).json(reservations);
  } catch (err) {
    console.error('Error fetching reservations:', err);
    res.status(500).json({ message: 'Failed to fetch reservations', error: err.message });
  }
}

// Update reservation status
export async function updateReservationStatus(req, res) {
  try {
    const { reservationId } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // First get the current reservation to check its status
    const currentReservation = await Reservation.findById(reservationId);
    
    if (!currentReservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    // Update the reservation status
    const reservation = await Reservation.findByIdAndUpdate(
      reservationId,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('vehicleId').populate('driverId').populate('userId', 'name email');

    // Handle vehicle and driver status updates based on the new status
    if (status === 'confirmed' && currentReservation.status !== 'confirmed') {
      // If confirming a reservation, update vehicle status to 'rented'
      await Vehicle.findByIdAndUpdate(
        currentReservation.vehicleId,
        { status: 'rented', updatedAt: Date.now() }
      );
      
      // If driver is required, update driver status to 'on_duty'
      if (currentReservation.driverRequired && currentReservation.driverId) {
        await Driver.findByIdAndUpdate(
          currentReservation.driverId,
          { status: 'on_duty', updatedAt: Date.now() }
        );
      }
    } 
    else if ((status === 'cancelled' || status === 'completed') && 
             currentReservation.status === 'confirmed') {
      // If cancelling or completing a confirmed reservation, update vehicle status back to 'available'
      await Vehicle.findByIdAndUpdate(
        currentReservation.vehicleId,
        { status: 'available', updatedAt: Date.now() }
      );
      
      // If driver was required, update driver status back to 'available'
      if (currentReservation.driverRequired && currentReservation.driverId) {
        await Driver.findByIdAndUpdate(
          currentReservation.driverId,
          { status: 'available', updatedAt: Date.now() }
        );
      }
    }

    // Refresh the reservation with the latest data after all updates
    const updatedReservation = await Reservation.findById(reservationId)
      .populate('vehicleId')
      .populate('driverId')
      .populate('userId', 'name email');

    res.status(200).json({
      message: `Reservation status updated to ${status}`,
      reservation: updatedReservation
    });
  } catch (err) {
    console.error('Error updating reservation status:', err);
    res.status(500).json({ message: 'Failed to update reservation status', error: err.message });
  }
}

// Cancel reservation
export async function cancelReservation(req, res) {
  try {
    const { reservationId } = req.params;

    // Check if user is authorized
    const reservation = await Reservation.findById(reservationId);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Only allow the reservation owner or admin to cancel
    if (!req.user.isAdmin && reservation.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this reservation' });
    }

    // Don't allow cancellation of completed reservations
    if (reservation.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed reservation' });
    }

    // Store previous status to check if it was confirmed
    const wasConfirmed = reservation.status === 'confirmed';

    // Update status to cancelled
    reservation.status = 'cancelled';
    reservation.updatedAt = Date.now();
    await reservation.save();

    // If the reservation was confirmed, free up vehicle and driver
    if (wasConfirmed) {
      // Update vehicle status back to available
      await Vehicle.findByIdAndUpdate(
        reservation.vehicleId,
        { status: 'available', updatedAt: Date.now() }
      );
      
      // If driver was required, update driver status back to available
      if (reservation.driverRequired && reservation.driverId) {
        await Driver.findByIdAndUpdate(
          reservation.driverId,
          { status: 'available', updatedAt: Date.now() }
        );
      }
    }

    // Get the updated reservation with populated details
    const updatedReservation = await Reservation.findById(reservationId)
      .populate('vehicleId')
      .populate('driverId')
      .populate('userId', 'name email');

    res.status(200).json({
      message: 'Reservation cancelled successfully',
      reservation: updatedReservation
    });
  } catch (err) {
    console.error('Error cancelling reservation:', err);
    res.status(500).json({ message: 'Failed to cancel reservation', error: err.message });
  }
}
