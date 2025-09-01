import express from "express";
import {registerUser, loginUser, verifyEmail, refreshAccessToken, logoutUser, getUserById} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logoutUser);
router.get("/searchUser/:id", getUserById);

export default router;
