import VehicleApplication from '../models/vehicleApplication.model.js';
import Vehicle from '../models/vehicle.model.js';
import path from 'path';
import fs from 'fs';

export async function registerVehicle(req, res) {
  try {
    const { make, model, year, price, description, ownerId: explicitOwnerId } = req.body;
    
    // Try to get owner ID from authenticated user or from request body
    let ownerId;
    
    if (req.user && req.user._id) {
      // Preferred: Get owner ID from authenticated user
      ownerId = req.user._id;
      console.log('Using authenticated user ID:', ownerId);
    } else if (explicitOwnerId) {
      // Fallback: Use owner ID provided in request body
      ownerId = explicitOwnerId;
      console.log('Using explicitly provided owner ID:', ownerId);
    } else {
      // Error: No owner ID available
      return res.status(401).json({ error: 'Owner ID not available. Please login again.' });
    }
    
    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    
    const vehicle = new VehicleApplication({
      owner: ownerId,
      make,
      model,
      year,
      price,
      description,
      imageUrl,
    });
    
    await vehicle.save();
    res.status(201).json({ 
      message: 'Vehicle registered successfully', 
      vehicle,
      ownerId: ownerId // Include owner ID in response for confirmation
    });
  } catch (err) {
    console.error('Error registering vehicle:', err);
    res.status(500).json({ error: err.message });
  }
}

// Admin endpoints

export async function getAllVehicleApplications(req, res) {
  try {
    const applications = await VehicleApplication.find()
      .populate('owner', 'name email') // Get owner details
      .sort({ createdAt: -1 }); // Sort by date (newest first)
    
    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getVehicleApplicationById(req, res) {
  try {
    const application = await VehicleApplication.findById(req.params.id)
      .populate('owner', 'name email');
    
    if (!application) {
      return res.status(404).json({ message: 'Vehicle application not found' });
    }
    
    res.status(200).json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function approveVehicleApplication(req, res) {
  try {
    // First find the application without populate to make sure we have the raw owner ID
    const application = await VehicleApplication.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Vehicle application not found' });
    }
    
    // Check if owner is valid
    if (!application.owner) {
      return res.status(400).json({ message: 'Vehicle application has no valid owner' });
    }
    
    // Update application status
    application.status = 'approved';
    await application.save();
    
    // Create a new vehicle record with Customer ownership
    const newVehicle = new Vehicle({
      make: application.make,
      model: application.model,
      year: application.year,
      price: application.price,
      description: application.description,
      imageUrl: application.imageUrl,
      ownership: 'Customer',  // Set ownership to Customer
      ownerId: application.owner,  // Store the customer's ID directly from the application
      applicationId: application._id,  // Reference back to the original application
      status: 'available'
    });
    
    await newVehicle.save();
    
    res.status(200).json({ 
      message: 'Vehicle application approved successfully and vehicle added to fleet',
      application,
      vehicle: newVehicle
    });
  } catch (err) {
    console.error('Error approving vehicle application:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function rejectVehicleApplication(req, res) {
  try {
    const application = await VehicleApplication.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Vehicle application not found' });
    }
    
    application.status = 'rejected';
    await application.save();
    
    res.status(200).json({ 
      message: 'Vehicle application rejected successfully',
      application 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Direct Vehicle Management (without application process)

export async function createVehicle(req, res) {
  try {
    const { make, model, year, price, description, imageUrl, ownership, status, ownerId: explicitOwnerId } = req.body;
    
    // Try to get owner ID from authenticated user or from request body
    let ownerId;
    
    if (req.user && req.user._id) {
      // Preferred: Get owner ID from authenticated user
      ownerId = req.user._id;
    } else if (explicitOwnerId) {
      // Fallback: Use owner ID provided in request body
      ownerId = explicitOwnerId;
    } else {
      // For company vehicles, admin becomes the owner
      ownerId = req.user._id;
    }
    
    const vehicle = new Vehicle({
      make,
      model,
      year: Number(year),
      price: Number(price),
      description,
      imageUrl,
      ownership: ownership || 'Company',
      ownerId,
      status: status || 'available'
    });
    
    await vehicle.save();
    res.status(201).json({ 
      message: 'Vehicle created successfully', 
      vehicle
    });
  } catch (err) {
    console.error('Error creating vehicle:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function getAllVehicles(req, res) {
  try {
    const vehicles = await Vehicle.find()
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getVehicleById(req, res) {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('ownerId', 'name email');
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    res.status(200).json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateVehicle(req, res) {
  try {
    const { make, model, year, price, description, imageUrl, status } = req.body;
    
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    // Update fields
    if (make) vehicle.make = make;
    if (model) vehicle.model = model;
    if (year) vehicle.year = Number(year);
    if (price) vehicle.price = Number(price);
    if (description) vehicle.description = description;
    if (imageUrl) vehicle.imageUrl = imageUrl;
    if (status) vehicle.status = status;
    
    vehicle.updatedAt = Date.now();
    
    await vehicle.save();
    
    res.status(200).json({ 
      message: 'Vehicle updated successfully', 
      vehicle 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteVehicle(req, res) {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    await Vehicle.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ 
      message: 'Vehicle deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Functions migrated from fleet controller

// Get all available vehicles for customers
export async function getAllAvailableVehicles(req, res) {
  try {
    const vehicles = await Vehicle.find({ status: 'available' })
      .sort({ createdAt: -1 })
      .populate('ownerId', 'name email');
    
    res.status(200).json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Search vehicles with filtering
export async function searchVehicles(req, res) {
  try {
    const { make, model, minPrice, maxPrice, year, ownership } = req.query;
    
    // Build the filter object
    const filter = { status: 'available' };
    if (make) filter.make = new RegExp(make, 'i');
    if (model) filter.model = new RegExp(model, 'i');
    if (year) filter.year = year;
    if (ownership) filter.ownership = ownership;
    
    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = minPrice;
      if (maxPrice) filter.price.$lte = maxPrice;
    }
    
    const vehicles = await Vehicle.find(filter)
      .sort({ price: 1 })
      .populate('ownerId', 'name email');
    
    res.status(200).json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get company owned vehicles for admin
export async function getCompanyVehicles(req, res) {
  try {
    const vehicles = await Vehicle.find({ ownership: 'Company' })
      .sort({ createdAt: -1 });
    
    res.status(200).json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get customer owned vehicles for admin
export async function getCustomerVehicles(req, res) {
  try {
    const vehicles = await Vehicle.find({ ownership: 'Customer' })
      .sort({ createdAt: -1 })
      .populate('ownerId', 'name email');
    
    res.status(200).json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
