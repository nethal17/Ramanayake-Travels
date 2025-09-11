// Mock data for development environment
const mockData = {
  driverProfile: {
    _id: "mock123driver",
    userId: "mock123user",
    age: 32,
    address: "123 Main Street, Colombo 06",
    status: "active",
    availability: true,
    yearsOfExperience: 7,
    dailyRate: 3500,
    drivingLicense: {
      licenseNumber: "B12345678",
      expiryDate: "2027-05-12",
      frontImage: "mock-license-front.jpg",
      backImage: "mock-license-back.jpg"
    },
    createdAt: "2023-08-15T10:30:00.000Z",
    updatedAt: "2023-09-01T15:20:00.000Z"
  },
  
  driverTrips: [
    {
      _id: "mock-trip-1",
      startDate: "2025-09-20T08:00:00.000Z",
      endDate: "2025-09-22T18:00:00.000Z",
      status: "confirmed",
      driverPrice: 10500,
      pickupLocation: "Colombo Fort",
      returnLocation: "Colombo Fort",
      notes: "Wedding transportation",
      vehicle: {
        _id: "mock-vehicle-1",
        name: "Toyota Land Cruiser",
        type: "SUV",
        regNumber: "KY-3568",
        imageUrl: "/assets/vehicle1.jpg"
      },
      customer: {
        _id: "mock-customer-1",
        name: "Saman Perera",
        email: "saman@example.com",
        phone: "+94712345678"
      }
    },
    {
      _id: "mock-trip-2",
      startDate: "2025-08-05T09:00:00.000Z",
      endDate: "2025-08-07T17:00:00.000Z",
      status: "completed",
      driverPrice: 8750,
      pickupLocation: "Negombo",
      returnLocation: "Colombo",
      notes: "Airport pickup and tour",
      vehicle: {
        _id: "mock-vehicle-2",
        name: "Toyota Hiace",
        type: "Van",
        regNumber: "PJ-8975",
        imageUrl: "/assets/vehicle2.jpg"
      },
      customer: {
        _id: "mock-customer-2",
        name: "John Smith",
        email: "john@example.com",
        phone: "+94777123456"
      }
    }
  ],
  // Mock data for featured vehicles
  featuredVehicles: {
    vehicles: [
      {
        _id: "mock-vehicle-1",
        make: "Toyota",
        model: "Land Cruiser",
        year: 2022,
        category: "SUV",
        transmission: "Automatic",
        fuel: "Diesel",
        seats: 7,
        pricePerDay: 25000,
        images: ["https://via.placeholder.com/800x600?text=Toyota+Land+Cruiser"],
        features: ["Air Conditioning", "Bluetooth", "Parking Sensors", "Backup Camera", "Sunroof"],
        isAvailable: true,
        rating: 4.9
      },
      {
        _id: "mock-vehicle-2",
        make: "Honda",
        model: "Civic",
        year: 2023,
        category: "Sedan",
        transmission: "Automatic",
        fuel: "Petrol",
        seats: 5,
        pricePerDay: 15000,
        images: ["https://via.placeholder.com/800x600?text=Honda+Civic"],
        features: ["Air Conditioning", "Bluetooth", "Navigation", "Cruise Control"],
        isAvailable: true,
        rating: 4.7
      },
      {
        _id: "mock-vehicle-3",
        make: "Toyota",
        model: "Hiace",
        year: 2021,
        category: "Van",
        transmission: "Manual",
        fuel: "Diesel",
        seats: 15,
        pricePerDay: 22000,
        images: ["https://via.placeholder.com/800x600?text=Toyota+Hiace"],
        features: ["Air Conditioning", "Bluetooth", "Large Cargo Space"],
        isAvailable: true,
        rating: 4.5
      },
      {
        _id: "mock-vehicle-4",
        make: "Nissan",
        model: "Leaf",
        year: 2022,
        category: "Hatchback",
        transmission: "Automatic",
        fuel: "Electric",
        seats: 5,
        pricePerDay: 18000,
        images: ["https://via.placeholder.com/800x600?text=Nissan+Leaf"],
        features: ["Air Conditioning", "Bluetooth", "Navigation", "Backup Camera", "Electric"],
        isAvailable: true,
        rating: 4.6
      }
    ]
  },
  
  // Mock data for auth
  auth: {
    refreshToken: {
      token: "mock-refresh-token-xyz",
      user: {
        _id: "mock-user-123",
        name: "Test User",
        email: "test@example.com",
        role: "customer"
      }
    },
    login: {
      token: "mock-jwt-token-abc",
      refreshToken: "mock-refresh-token-xyz",
      user: {
        _id: "mock-user-123",
        name: "Test User",
        email: "test@example.com",
        role: "customer"
      }
    }
  }
};

export default mockData;
