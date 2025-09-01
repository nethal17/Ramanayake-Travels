import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import cookieParser from 'cookie-parser';

import { connectDB } from './lib/db.js';

import authRoutes from "./routes/user.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
	origin: 'http://localhost:5173',
	credentials: true, 
}));

app.use(express.json());
app.use(cookieParser());

app.listen(PORT, () => {
	console.log("Server is running on http://localhost:" + PORT);
	connectDB();
});

app.use("/api/auth", authRoutes);