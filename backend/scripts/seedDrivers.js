import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Driver from '../models/driver.model.js';
import { connectDB } from '../lib/db.js';

dotenv.config();

// Sample driver data
const driverData = [
  {
    name: "Sanath Perera",
    licenseNumber: "DL12345678",
    experience: 8,
    contactNumber: "+94712345678",
    email: "sanath.p@gmail.com",
    dailyRate: 2500,
    imageUrl: "https://randomuser.me/api/portraits/men/1.jpg",
    rating: 4.8,
    languages: ["English", "Sinhala", "Tamil"],
    specializations: ["Long Distance", "Tourist Guide"],
    status: "available"
  },
  {
    name: "Kumara Bandara",
    licenseNumber: "DL87654321",
    experience: 12,
    contactNumber: "+94723456789",
    email: "kumara.b@gmail.com",
    dailyRate: 3000,
    imageUrl: "https://randomuser.me/api/portraits/men/2.jpg",
    rating: 4.9,
    languages: ["English", "Sinhala"],
    specializations: ["Off-road", "Mountain Travel"],
    status: "available"
  },
  {
    name: "Priyantha Silva",
    licenseNumber: "DL55667788",
    experience: 5,
    contactNumber: "+94734567890",
    email: "priyantha.s@gmail.com",
    dailyRate: 2000,
    imageUrl: "https://randomuser.me/api/portraits/men/3.jpg",
    rating: 4.6,
    languages: ["English", "Sinhala"],
    specializations: ["City Tours", "Airport Transfer"],
    status: "available"
  },
  {
    name: "Lakshman Fernando",
    licenseNumber: "DL11223344",
    experience: 15,
    contactNumber: "+94745678901",
    email: "lakshman.f@gmail.com",
    dailyRate: 3500,
    imageUrl: "https://randomuser.me/api/portraits/men/4.jpg",
    rating: 5.0,
    languages: ["English", "Sinhala", "Tamil", "Hindi"],
    specializations: ["VIP Transport", "Wedding Chauffeur"],
    status: "available"
  },
  {
    name: "Nimal Jayasinghe",
    licenseNumber: "DL99887766",
    experience: 7,
    contactNumber: "+94756789012",
    email: "nimal.j@gmail.com",
    dailyRate: 2200,
    imageUrl: "https://randomuser.me/api/portraits/men/5.jpg",
    rating: 4.7,
    languages: ["English", "Sinhala"],
    specializations: ["Family Tours", "Beach Tours"],
    status: "available"
  }
];

// Connect to MongoDB
async function seedDrivers() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing drivers
    await Driver.deleteMany({});
    console.log('Cleared existing drivers');

    // Insert new drivers
    const drivers = await Driver.insertMany(driverData);
    console.log(`${drivers.length} drivers seeded successfully`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding drivers:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDrivers();
