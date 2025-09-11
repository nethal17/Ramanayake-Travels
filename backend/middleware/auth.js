import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { blacklistedTokens } from "../controllers/user.controller.js";

export async function isAuthenticated(req, res, next) {
  try {
    console.log('Authentication middleware called');
    
    // Get token from cookies or authorization header
    let token = req.cookies?.accessToken || req.cookies?.token;
    
    // Check for Bearer token in Authorization header
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader);
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
      console.log('Using token from Authorization header:', token.substring(0, 10) + '...');
    }
    
    console.log('Token present:', !!token);
    
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No access token provided" });
    }
    
    // Check if token is blacklisted
    if (blacklistedTokens && blacklistedTokens.has && blacklistedTokens.has(token)) {
      return res.status(401).json({ message: "Unauthorized - Token revoked" });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallbacksecretfordevonly');
    console.log('Token verified, user ID:', decoded.id);
    
    // Use the same claim name as when you sign tokens
    const userId = decoded.id ?? decoded.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized - Invalid token payload" });
    
    // Find user by ID
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    } else {
      // Set user in request
      req.user = user;
      console.log(`Authenticated user: ${user.name} (${user._id}), role: ${user.role}`);
    }
    
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized - Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export function isAdmin(req, res, next) {
  // Check if user exists and has admin role
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied - Admin only" });
  
  console.log('Admin access granted for user:', req.user._id);
  next();
}

export function isDriver(req, res, next) {
  // Check if user exists and has driver role
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (req.user.role !== "driver") {
    console.log('Access denied - Not a driver. User role:', req.user.role);
    return res.status(403).json({ 
      message: "Access denied - Driver only",
      currentRole: req.user.role,
      requiredRole: "driver" 
    });
  }
  
  console.log('Driver access granted for user:', req.user._id);
  next();
}

// Aliases for backward compatibility
export const protectRoute = isAuthenticated;
export const adminRoute = isAdmin;

