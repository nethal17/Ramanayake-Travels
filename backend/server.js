import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";

import { connectDB } from './lib/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
	origin: 'http://localhost:5173',
	credentials: true, 
}));

app.use(express.json());

app.listen(PORT, () => {
	console.log("Server is running on http://localhost:" + PORT);
	connectDB();
});