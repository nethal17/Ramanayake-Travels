import VehicleApplication from '../models/vehicleApplication.model.js';

export async function getMyVehicles(req, res) {
  try {
    const vehicles = await VehicleApplication.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
