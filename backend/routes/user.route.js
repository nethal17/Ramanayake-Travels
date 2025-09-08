import express from "express";
import {registerUser, loginUser, verifyEmail, refreshAccessToken, logoutUser, getUserById, getUsers, forgotPassword} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.js";
import { adminRoute } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logoutUser);
router.get("/searchUser/:id", getUserById);
router.get("/allUsers", protectRoute, adminRoute, getUsers);
router.post("/forgot-password", forgotPassword);

export default router;
