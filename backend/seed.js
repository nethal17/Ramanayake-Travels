import mongoose from 'mongoose';
import { connectDB } from './lib/db.js';
import VehicleApplication from './models/vehicleApplication.model.js';
import dotenv from 'dotenv';

dotenv.config();

// Sample data for vehicle applications
const sampleVehicles = [
  {
    make: 'Toyota',
    model: 'Corolla',
    year: 2020,
    price: 5000,
    description: 'Well maintained sedan in excellent condition. Low mileage, regular service history.',
    status: 'pending',
    owner: '64f0c0e2b1a2c3d4e5f6a7b8', // This should match the dummy user ID in auth.js
    imageUrl: ''
  },
  {
    make: 'Honda',
    model: 'Civic',
    year: 2019,
    price: 4500,
    description: 'Fuel efficient and reliable compact car with modern features.',
    status: 'approved',
    owner: '64f0c0e2b1a2c3d4e5f6a7b8',
    imageUrl: ''
  },
  {
    make: 'Nissan',
    model: 'Sentra',
    year: 2021,
    price: 6000,
    description: 'Perfect family car with spacious interior and safety features.',
    status: 'pending',
    owner: '64f0c0e2b1a2c3d4e5f6a7b8',
    imageUrl: ''
  },
  {
    make: 'Mazda',
    model: 'CX-5',
    year: 2022,
    price: 7500,
    description: 'SUV with excellent handling and premium feel. Perfect for long trips.',
    status: 'approved',
    owner: '64f0c0e2b1a2c3d4e5f6a7b8',
    imageUrl: ''
  },
  {
    make: 'Kia',
    model: 'Forte',
    year: 2018,
    price: 3800,
    description: 'Budget-friendly sedan with good fuel economy.',
    status: 'rejected',
    owner: '64f0c0e2b1a2c3d4e5f6a7b8',
    imageUrl: ''
  },
  {
    make: 'Hyundai',
    model: 'Elantra',
    year: 2020,
    price: 4200,
    description: 'Sleek, modern design with all the latest tech features.',
    status: 'pending',
    owner: '64f0c0e2b1a2c3d4e5f6a7b8',
    imageUrl: ''
  }
];

// Function to seed the database
const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Delete existing records first
    await VehicleApplication.deleteMany({});
    console.log('Existing vehicle applications deleted');
    
    // Insert sample data
    await VehicleApplication.insertMany(sampleVehicles);
    console.log('Sample vehicle applications added to database');
    
    // Close the connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
