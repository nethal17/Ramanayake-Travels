dotenv.config();
import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import cookieParser from 'cookie-parser';
import { connectDB } from './lib/db.js';
import authRoutes from "./routes/user.route.js";
import vehicleRoutes from './routes/vehicle.route.js';
import profileRoutes from './routes/profile.route.js';
import reservationRoutes from './routes/reservation.route.js';
import driverRoutes from './routes/driver.route.js';
import technicianRoutes from './routes/technician.route.js';
import maintenanceRoutes from './routes/maintenance.route.js';
import inquiryRoutes from './routes/inquiry.route.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir);
}

// Ensure inquiries uploads directory exists
const inquiriesUploadsDir = path.join(__dirname, 'uploads/inquiries');
if (!fs.existsSync(inquiriesUploadsDir)) {
	fs.mkdirSync(inquiriesUploadsDir, { recursive: true });
}

app.use(cors({
	origin: 'http://localhost:5173',
	credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Debug middleware to log request headers
app.use((req, res, next) => {
  console.log('Request URL:', req.url);
  console.log('Authorization header:', req.headers.authorization);
  next();
});

// Serve uploads statically
app.use('/uploads', express.static(uploadsDir));

// API routes
app.use("/api/auth", authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/inquiries', inquiryRoutes);

app.listen(PORT, () => {
	console.log("Server is running on http://localhost:" + PORT);
	connectDB();
});