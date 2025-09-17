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
      pickupLocation,
      returnLocation,
      notes 
    } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'You must be logged in to make a reservation' });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (vehicle.status !== 'available') {
      return res.status(400).json({ message: 'Vehicle is not available for reservation' });
    }

    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);

    if (pickup < new Date()) {
      return res.status(400).json({ message: 'Pickup date cannot be in the past' });
    }

    if (returnD <= pickup) {
      return res.status(400).json({ message: 'Return date must be after pickup date' });
    }

    const existingReservations = await Reservation.find({
      vehicleId: vehicleId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { pickupDate: { $lte: returnD }, returnDate: { $gte: pickup } },
        { pickupDate: { $lte: returnD }, returnDate: { $gte: pickup } }
      ]
    });

    if (existingReservations.length > 0) {
      return res.status(400).json({ message: 'Vehicle is already reserved for these dates' });
    }

    const days = Math.max(1, differenceInDays(returnD, pickup));
    const basePrice = vehicle.price * days;

    let driver = null;
    let driverPrice = 0;

    if (driverRequired && driverId) {
      driver = await Driver.findById(driverId);
      if (!driver) {
        return res.status(404).json({ message: 'Driver not found' });
      }

      if (driver.status !== 'active' || !driver.availability) {
        return res.status(400).json({ message: 'Selected driver is not available' });
      }
      
      const driverBookingConflict = await Reservation.findOne({
        driverId: driverId,
        status: { $in: ['pending', 'confirmed'] },
        $or: [
          { pickupDate: { $lte: returnD }, returnDate: { $gte: pickup } },
          { pickupDate: { $lte: returnD }, returnDate: { $gte: pickup } }
        ]
      });
      
      if (driverBookingConflict) {
        return res.status(400).json({ message: 'Selected driver is already booked for these dates' });
      }

      const dailyRate = driver.dailyRate || 2500;
      driverPrice = dailyRate * days;
    }

    const totalPrice = basePrice + driverPrice;

    const reservation = new Reservation({
      vehicleId,
      userId: req.user._id,
      pickupDate: pickup,
      returnDate: returnD,
      pickupLocation,
      returnLocation,
      driverRequired,
      driverId: driver ? driver._id : null,
      totalPrice,
      basePrice,
      driverPrice,
      status: 'pending',
      notes
    });

    await reservation.save();

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
    const { pickupDate, returnDate } = req.query;
    
    if (pickupDate && returnDate) {
      const pickup = new Date(pickupDate);
      const returnD = new Date(returnDate);
      
      const conflictingReservations = await Reservation.find({
        driverRequired: true,
        status: { $in: ['pending', 'confirmed'] },
        $or: [
          { pickupDate: { $lte: returnD }, returnDate: { $gte: pickup } },
          { pickupDate: { $lte: returnD }, returnDate: { $gte: pickup } }
        ]
      });
      
      const unavailableDriverIds = conflictingReservations.map(res => res.driverId).filter(id => id);
      
      const availableDrivers = await Driver.find({
        status: 'active',
        availability: true,
        _id: { $nin: unavailableDriverIds }
      }).populate('userId', 'name');
      
      return res.status(200).json(availableDrivers);
    }
    
    const drivers = await Driver.find({ 
      status: 'active',
      availability: true
    }).populate('userId', 'name');
    
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

    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (vehicle.status !== 'available') {
      return res.status(200).json({ available: false, message: 'Vehicle is not available for booking' });
    }

    const existingReservations = await Reservation.find({
      vehicleId: vehicleId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { pickupDate: { $lte: returnD }, returnDate: { $gte: pickup } },
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

    const days = Math.max(1, differenceInDays(returnD, pickup));
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

    const currentReservation = await Reservation.findById(reservationId);
    
    if (!currentReservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    const reservation = await Reservation.findByIdAndUpdate(
      reservationId,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('vehicleId').populate('driverId').populate('userId', 'name email');

    if (status === 'confirmed' && currentReservation.status !== 'confirmed') {
      await Vehicle.findByIdAndUpdate(
        currentReservation.vehicleId,
        { status: 'rented', updatedAt: Date.now() }
      );
      
      if (currentReservation.driverRequired && currentReservation.driverId) {
        await Driver.findByIdAndUpdate(
          currentReservation.driverId,
          { availability: false, updatedAt: Date.now() }
        );
      }
    } 
    else if ((status === 'cancelled' || status === 'completed') && 
             currentReservation.status === 'confirmed') {
      await Vehicle.findByIdAndUpdate(
        currentReservation.vehicleId,
        { status: 'available', updatedAt: Date.now() }
      );
      
      if (currentReservation.driverRequired && currentReservation.driverId) {
        await Driver.findByIdAndUpdate(
          currentReservation.driverId,
          { availability: true, updatedAt: Date.now() }
        );
      }
    }

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

    const reservation = await Reservation.findById(reservationId);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (!req.user.isAdmin && reservation.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this reservation' });
    }

    if (reservation.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed reservation' });
    }

    const wasConfirmed = reservation.status === 'confirmed';

    reservation.status = 'cancelled';
    reservation.updatedAt = Date.now();
    await reservation.save();

    if (wasConfirmed) {
      await Vehicle.findByIdAndUpdate(
        reservation.vehicleId,
        { status: 'available', updatedAt: Date.now() }
      );
      
      if (reservation.driverRequired && reservation.driverId) {
        await Driver.findByIdAndUpdate(
          reservation.driverId,
          { availability: true, updatedAt: Date.now() }
        );
      }
    }

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

// Get reservations for a driver (to be used in driver profile)
export async function getDriverReservations(req, res) {
  try {
    const userId = req.user._id;
    
    const driver = await Driver.findOne({ userId });
    
    if (!driver) {
      return res.status(404).json({ message: 'Driver profile not found' });
    }
    
    const reservations = await Reservation.find({ 
      driverId: driver._id,
      status: { $in: ['confirmed', 'completed'] }
    })
    .populate('vehicleId', 'make model year regNumber type dailyRate imageUrl')
    .populate('userId', 'name email phone')
    .sort({ pickupDate: -1 });
    
    const formattedReservations = reservations.map(reservation => {
      return {
        _id: reservation._id,
        startDate: reservation.pickupDate,
        endDate: reservation.returnDate,
        status: reservation.status,
        driverPrice: reservation.driverPrice,
        paymentStatus: reservation.paymentStatus,
        notes: reservation.notes,
        pickupLocation: reservation.pickupLocation,
        returnLocation: reservation.returnLocation,
        vehicle: {
          _id: reservation.vehicleId?._id,
          name: `${reservation.vehicleId?.make} ${reservation.vehicleId?.model}`,
          year: reservation.vehicleId?.year,
          type: reservation.vehicleId?.type,
          regNumber: reservation.vehicleId?.regNumber,
          imageUrl: reservation.vehicleId?.imageUrl
        },
        customer: {
          _id: reservation.userId?._id,
          name: reservation.userId?.name,
          email: reservation.userId?.email,
          phone: reservation.userId?.phone
        }
      };
    });
    
    res.status(200).json(formattedReservations);
  } catch (err) {
    console.error('Error getting driver reservations:', err);
    res.status(500).json({ message: 'Failed to get driver reservations', error: err.message });
  }
}

// Update trip status by driver
export async function updateTripStatus(req, res) {
  try {
    console.log('updateTripStatus called, user:', req.user?._id, 'role:', req.user?.role);
    
    const { reservationId } = req.params;
    const { status } = req.body;
    
    console.log('Request params:', { reservationId, status });
    
    if (!['started', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "started" or "completed"' });
    }
    
    const reservation = await Reservation.findById(reservationId);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    console.log('Reservation found:', reservation._id);
    
    let reservationStatus = reservation.status;
    if (status === 'started') {
      reservationStatus = 'confirmed';
    } else if (status === 'completed') {
      reservationStatus = 'completed';
    }
    
    const updatedReservation = await Reservation.findByIdAndUpdate(
      reservationId,
      { 
        status: reservationStatus,
        tripStatus: status,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).populate('vehicleId').populate('driverId').populate('userId', 'name email phone');
    
    if (status === 'completed') {
      await Vehicle.findByIdAndUpdate(
        updatedReservation.vehicleId,
        { status: 'available' }
      );
      
      if (updatedReservation.driverId) {
        await Driver.findByIdAndUpdate(
          updatedReservation.driverId,
          { availability: true }
        );
      }
    }
    
    res.status(200).json({
      message: `Trip ${status === 'started' ? 'started' : 'completed'} successfully`,
      reservation: updatedReservation
    });
  } catch (err) {
    console.error('Error updating trip status:', err);
    res.status(500).json({ message: 'Failed to update trip status', error: err.message });
  }
}

// Update payment status (admin only)
export async function updatePaymentStatus(req, res) {
  try {
    const { reservationId } = req.params;
    const { paymentStatus, billDetails } = req.body;
    
    
    if (!['unpaid', 'partially_paid', 'paid'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status value' });
    }
    
    const currentReservation = await Reservation.findById(reservationId);
    
    if (!currentReservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    
    const updateFields = { 
      paymentStatus, 
      updatedAt: Date.now() 
    };
    
 
    if (billDetails) {
      updateFields.billDetails = billDetails;
    }
    
    const reservation = await Reservation.findByIdAndUpdate(
      reservationId,
      updateFields,
      { new: true, runValidators: true }
    ).populate('vehicleId')
      .populate('driverId')
      .populate('userId', 'name email');
    
    res.status(200).json({
      message: `Payment status updated to ${paymentStatus}`,
      reservation
    });
  } catch (err) {
    console.error('Error updating payment status:', err);
    res.status(500).json({ message: 'Failed to update payment status', error: err.message });
  }
}
