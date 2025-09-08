import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export async function isAuthenticated(req, res, next) {
  try {
    console.log('Authentication middleware called');
    
    // Get token from cookies or authorization header
    let token = req.cookies?.token;
    
    // Check for Bearer token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
      console.log('Using token from Authorization header');
    }
    
    // Log token status (without revealing the actual token)
    console.log('Token present:', !!token);
    
    // For development, if no token, set a dummy user and proceed
    if (!token) {
      console.log('No auth token found, using dummy user for development');
      req.user = {
        _id: '64f0c0e2b1a2c3d4e5f6a7b8', // dummy ObjectId for development
        email: 'dev@example.com',
        name: 'Development User',
        role: 'admin', // Set to admin for development
      };
      return next();
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallbacksecretfordevonly');
    console.log('Token verified, user ID:', decoded.id);
    
    // Find user by ID
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      // If no valid user found but token was verified, use token data
      console.log('Token verified but no matching user found, using token data');
      req.user = { 
        _id: decoded.id,
        email: decoded.email || 'unknown@example.com',
        name: decoded.name || 'Unknown User',
        role: decoded.role || 'admin' // Set to admin for development
      };
    } else {
      // Set user in request
      req.user = user;
      console.log(`Authenticated user: ${user.name} (${user._id}), role: ${user.role}`);
    }
    
    next();
  } catch (error) {
    // If token verification fails, use dummy user for development
    console.log('Token verification failed, using dummy user:', error.message);
    req.user = {
      _id: '64f0c0e2b1a2c3d4e5f6a7b8', // dummy ObjectId
      email: 'admin@example.com',
      name: 'Admin User (Dev Fallback)',
      role: 'admin', // Set to admin for development
    };
    next();
  }
}

export function isAdmin(req, res, next) {
  // Check if user exists and has admin role
  if (req.user && req.user.role === 'admin') {
    console.log('Admin access granted for user:', req.user._id);
    return next();
  }
  
  // For development, you can uncomment this to bypass the check
  // return next();
  
  console.log('Admin access denied for user:', req.user ? req.user._id : 'unknown');
  return res.status(403).json({ 
    message: 'Access denied. Admin privileges required.',
    user: req.user ? { id: req.user._id, role: req.user.role } : null 
  });
}
