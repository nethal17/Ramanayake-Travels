import express from "express";
import multer from "multer";
import path from "path";
import {registerUser, loginUser, verifyEmail, refreshAccessToken, logoutUser, getUserById, getUsers, forgotPassword, resetPassword, changePassword, updateUserDetails} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.js";
import { adminRoute } from "../middleware/auth.js";

const router = express.Router();

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logoutUser);
router.get("/searchUser/:id", getUserById);
router.get("/allUsers", protectRoute, adminRoute, getUsers);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/change-password/:id", protectRoute, changePassword);
router.put("/update/:id", protectRoute, upload.single('profilePic'), updateUserDetails);

export default router;
