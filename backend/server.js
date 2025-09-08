dotenv.config();
import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import cookieParser from 'cookie-parser';
import { connectDB } from './lib/db.js';
import authRoutes from "./routes/user.route.js";
import vehicleRoutes from './routes/vehicle.route.js';
import profileRoutes from './routes/profile.route.js';
import adminRoutes from './routes/admin.route.js';
import driverRoutes from './routes/driver.route.js';
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

app.use(cors({
	origin: 'http://localhost:5173',
	credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Serve uploads statically
app.use('/uploads', express.static(uploadsDir));

// API routes
app.use("/api/auth", authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', adminRoutes);
app.use('/api/drivers', driverRoutes);

app.listen(PORT, () => {
	console.log("Server is running on http://localhost:" + PORT);
	connectDB();
});