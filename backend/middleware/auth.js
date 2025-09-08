import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { blacklistedTokens } from "../controllers/user.controller.js";


export const protectRoute = async (req, res, next) => {
	try {
		// Accept cookie or Authorization header
		const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];
		if (!token) return res.status(401).json({ message: "Unauthorized - No access token provided" });

		// Check revocation
		if (blacklistedTokens && blacklistedTokens.has && blacklistedTokens.has(token)) {
			return res.status(401).json({ message: "Unauthorized - Token revoked" });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Use the same claim name as when you sign tokens (recommend 'id')
		const userId = decoded.id ?? decoded.userId;
		if (!userId) return res.status(401).json({ message: "Unauthorized - Invalid token payload" });

		const user = await User.findById(userId).select("-password");
		if (!user) return res.status(401).json({ message: "Unauthorized - User not found" });

		req.user = user;
		next();
	} catch (error) {
		if (error.name === "TokenExpiredError") {
			return res.status(401).json({ message: "Unauthorized - Token expired" });
		}
		if (error.name === "JsonWebTokenError") {
			return res.status(401).json({ message: "Unauthorized - Invalid token" });
		}
		console.error("protectRoute error:", error);
		return res.status(500).json({ message: "Server error" });
	}
};

export const adminRoute = (req, res, next) => {
	if (!req.user) return res.status(401).json({ message: "Unauthorized" });
	if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied - Admin only" });
	next();
};

