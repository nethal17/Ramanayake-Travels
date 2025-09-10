import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { transporter, defaultMailOptions } from "../lib/nodemailer.js";
import { sendPasswordAfterVerification } from "./driver.controller.js";

const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

export const blacklistedTokens = new Set();

export const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendVerificationCode = async (email, code) => {
    const mailOptions = {
        ...defaultMailOptions,
        to: email,
        subject: "Your Verification Code - Ramanayake Travels",
        html: `
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <tr>
                    <td style="padding: 20px; text-align: center;">
                        <h1 style="color: #2c3e50; margin-bottom: 10px;">Verification Code</h1>
                        <p style="color: #7f8c8d; font-size: 16px;">Please use this code to verify your account</p>
                    </td>
                </tr>
                <tr>
                    <td style="background-color: #f8f9fa; padding: 20px;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                                <td style="padding: 20px; text-align: center;">
                                    <p style="color: #34495e; margin-bottom: 20px;">Your verification code is:</p>
                                    
                                    <table style="margin: 20px auto;">
                                        <tr>
                                            <td style="background-color: #ffffff; padding: 15px 30px; border-radius: 4px;">
                                                <span style="font-size: 32px; color: #3b82f6; letter-spacing: 5px; font-weight: bold;">${code}</span>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <p style="color: #34495e; margin: 20px 0;">This verification code will expire in <strong>10 minutes</strong>.</p>
                                    
                                    <table style="background-color: #fff3cd; color: #856404; padding: 15px; margin: 20px 0; text-align: left; width: 100%;">
                                        <tr>
                                            <td>
                                                <p style="margin: 0;"><strong>Important:</strong> Please do not share this code with anyone. Our team will never ask for your verification code.</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="text-align: center; color: #7f8c8d; font-size: 14px; padding: 20px;">
                        <p>This is an automated message. Please do not reply to this email.</p>
                    </td>
                </tr>
                <tr>
                    <td style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
                        <p style="color: #7f8c8d; font-size: 12px;">© 2024 Agri-Waste Marketplace. All rights reserved.</p>
                    </td>
                </tr>
            </table>
        `
    };

    await transporter.sendMail(mailOptions);
};

export const verifyEmail = async (req, res) => {
    const { token } = req.params;

    try {
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).json({ msg: "Invalid or expired token" });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        // If user is a driver, send password via email
        if (user.role === 'driver') {
            await sendPasswordAfterVerification(user._id);
        }

        // Redirect to the success page
        res.redirect('http://localhost:5173/email-verification-success');
        
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Server Error" });
    }
};

export const registerUser = async (req, res) => {
    const { name, email, phone, password, role } = req.body;

    
    if (!name || !email || !phone || !password || !role) {
        return res.status(400).json({ msg: "Please fill in all fields." });
    }

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const verificationToken = crypto.randomBytes(32).toString("hex");

        user = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            role,
            verificationToken
        });

        await user.save();

        const verificationURL = `http://localhost:5001/api/auth/verify-email/${verificationToken}`;
        const mailOptions = {
            ...defaultMailOptions,
            to: user.email,
            subject: "Welcome to Ramanayake Travels - Verify Your Email",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #2c3e50; margin-bottom: 10px;">Welcome to Ramanayake Travels!</h1>
                        <p style="color: #7f8c8d; font-size: 16px;">Thank you for registering with us. We're excited to have you on board!</p>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
                        <p style="color: #34495e; margin-bottom: 20px;">To complete your registration and start using our platform, please verify your email address by clicking the button below:</p>
                        
                        <div style="text-align: center;">
                            <a href="${verificationURL}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 20px 0;">Verify Email Address</a>
                        </div>
                        
                        <p style="color: #7f8c8d; font-size: 14px; margin-top: 20px;">If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
                        <p style="word-break: break-all; color: #3498db; font-size: 14px;">${verificationURL}</p>
                    </div>
                    
                    <div style="text-align: center; color: #7f8c8d; font-size: 14px;">
                        <p>This verification link will expire in 24 hours.</p>
                        <p>If you didn't create an account with us, please ignore this email.</p>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
                        <p style="color: #7f8c8d; font-size: 12px;">© 2024 Agri-Waste Marketplace. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({
            msg: "User registered. Please check your email to verify your account."
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Server Error", error: err.message });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: "User didn't exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        if (!user.isVerified && !user.twoFactorEnabled) {
            return res.status(400).json({ msg: "Please verify your email first" });
        }

        // If 2FA is enabled, generate and send verification code
        if (user.twoFactorEnabled) {
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            user.twoStepVerificationCode = verificationCode;
            user.twoStepVerificationExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
            await user.save();

            await sendVerificationCode(user.email, verificationCode);
            
            return res.json({ 
                requiresVerification: true,
                msg: "Verification code sent to your email"
            });
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshToken = refreshToken;
        await user.save();

        // Set refresh token as HTTP-only cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            // Lax is friendlier for local dev (different ports). Use 'none' with secure in prod if cross-site.
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Set access token as HTTP-only cookie
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            // Lax is friendlier for local dev (different ports). Use 'none' with secure in prod if cross-site.
            sameSite: "lax",
            path: "/",
            maxAge: 1 * 24 * 60 * 60 * 1000 // 1 days
        });

        // Send complete user data in response
        res.json({ 
            accessToken, 
            user: { 
                _id: user._id,
                name: user.name, 
                email: user.email, 
                phone: user.phone,
                role: user.role,
                profilePic: user.profilePic,
                isVerified: user.isVerified,
                twoFactorEnabled: user.twoFactorEnabled,
                createdAt: user.createdAt
            } 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error", error: err.message });
    }
};

/*export const logoutUser = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    const refreshToken = req.cookies.refreshToken;

    if (!token && !refreshToken) {
        console.log("Logout failed: No token or refresh token provided");
        return res.status(400).json({ message: "No token or refresh token provided" });
    }

    if (token && blacklistedTokens.has(token)) {
        return res.status(401).json({ msg: "You are already logged out. Please log in." });
    }

    try {
        if (token) {
            // Add access token to blacklist
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            blacklistedTokens.add(token);
        }

        if (refreshToken) {
            // Remove refresh token from user document
            const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await User.findByIdAndUpdate(payload.id, { $unset: { refreshToken: "" } });
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
            });
        }

        res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
        console.error("Logout error:", err);

        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ msg: "Invalid token" });
        }

        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ msg: "Token has expired" });
        }

        res.status(500).json({ msg: "Server Error" });
    }
}; */

export const logoutUser = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await User.findByIdAndUpdate(decoded.id, { $unset: { refreshToken: "" } });
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        localStorage.clear();
        res.json({message: "Logged out successfully"});
    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
}  

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: "User not found" });

        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 7200000; // 1 hour expiration
        await user.save();

        const resetURL = `http://localhost:5173/reset-password/${resetToken}`;
        const mailOptions = {
            ...defaultMailOptions,
            to: user.email,
            subject: "Password Reset Request - Agri-Waste Marketplace",
            html: `
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <tr>
                        <td style="padding: 20px; text-align: center;">
                            <h1 style="color: #2c3e50; margin-bottom: 10px;">Password Reset Request</h1>
                            <p style="color: #7f8c8d; font-size: 16px;">We received a request to reset your password</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 20px;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="padding: 20px; text-align: center;">
                                        <p style="color: #34495e; margin-bottom: 20px;">Hello ${user.name},</p>
                                        <p style="color: #34495e; margin-bottom: 20px;">We received a request to reset your password for your Ramanayake Travels account. If you didn't make this request, you can safely ignore this email.</p>
                                        
                                        <table style="margin: 30px auto;">
                                            <tr>
                                                <td>
                                                    <a href="${resetURL}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <p style="color: #34495e; margin: 20px 0;">This password reset link will expire in 1 hour.</p>
                                        
                                        <table style="background-color: #fff3cd; color: #856404; padding: 15px; margin: 20px 0; text-align: left; width: 100%;">
                                            <tr>
                                                <td>
                                                    <p style="margin: 0;"><strong>Important:</strong> For security reasons, please do not share this link with anyone. Our team will never ask for your password or reset link.</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align: center; color: #7f8c8d; font-size: 14px; padding: 20px;">
                            <p>This is an automated message. Please do not reply to this email.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
                            <p style="color: #7f8c8d; font-size: 12px;">© 2024 Agri-Waste Marketplace. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ msg: "Reset link sent to email" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Server Error" });
    }
};

export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() } 
        });

        if (!user) {
            return res.status(400).json({ msg: "Invalid or expired token" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ msg: "Password successfully reset" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Server Error" });
    }
};

export const verifyTwoStepCode = async (req, res) => {
    const { userId, code } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        if (
            user.twoStepVerificationCode === code &&
            user.twoStepVerificationExpire > Date.now()
        ) {
            user.twoStepVerificationCode = undefined;
            user.twoStepVerificationExpire = undefined;
            await user.save();

            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            // Return a single response with all necessary data
            res.json({ 
                token, 
                user: { 
                    _id: user._id,
                    name: user.name, 
                    email: user.email, 
                    phone: user.phone,
                    role: user.role,
                    profilePic: user.profilePic,
                    isVerified: user.isVerified,
                    twoFactorEnabled: user.twoFactorEnabled,
                    createdAt: user.createdAt
                } 
            });

            user.isVerified = true;
            await user.save();

        } else {
            res.status(400).json({ msg: "Invalid or expired verification code" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Server Error" });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json({ count: users.length, data: users });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
};

export const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        res.status(200).json(user);

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
};

export const updateUserDetails = async (req, res) => {
    const { id } = req.params;

    try {
        const { name, email, phone } = req.body;
        if (!name || !email || !phone) {
            return res.status(400).json({ message: "Name, email, and phone are required" });
        }

        let updatedData = { name, email, phone };

        const result = await User.findByIdAndUpdate(id, updatedData, { new: true });

        if (!result) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User updated successfully", user: result });

    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateSecurityTimestamp = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findByIdAndUpdate(
            id,
            { lastSecurityUpdate: new Date() },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "Security timestamp updated", lastSecurityUpdate: user.lastSecurityUpdate });
    } catch (err) {
        console.error("Error updating security timestamp:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const changePassword = async (req, res) => {
    const { id } = req.params;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: "New passwords do not match" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.lastSecurityUpdate = new Date();
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (err) {
        console.error("Error changing password:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        if (user.isVerified === false) {
            // Store user email before deletion
            const userEmail = user.email;
            const userName = user.name;
            
            // Delete user from database
            const result = await User.findByIdAndDelete(id);
            
            if (!result) {
                return res.status(404).json({ message: "User not found" });
            }

            // Send deletion email notification
            const mailOptions = {
                ...defaultMailOptions,
                to: userEmail,
                subject: "Account Deletion Notice - Agri-Waste Marketplace",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #2c3e50; margin-bottom: 10px;">Account Deletion Notice</h1>
                        </div>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
                            <p style="color: #34495e; margin-bottom: 20px;">Dear ${userName},</p>
                            
                            <p style="color: #34495e;">We regret to inform you that your account has been deleted from the Agri-Waste Marketplace platform.</p>
                            
                            <p style="color: #34495e;">If you wish to continue using our services, you can register a new account by clicking the button below:</p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="http://localhost:5173/register" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Register with Us</a>
                            </div>
                            
                            <p style="color: #34495e;">We look forward to having you back in our community!</p>
                        </div>
                        
                        <div style="text-align: center; color: #7f8c8d; font-size: 14px;">
                            <p>This is an automated message. Please do not reply to this email.</p>
                        </div>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
                            <p style="color: #7f8c8d; font-size: 12px;">© 2024 Agri-Waste Marketplace. All rights reserved.</p>
                        </div>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
            
            return res.status(200).json({ message: "User deleted successfully" });
        }

        // If user is verified, deactivate their account instead of deleting
        user.isVerified = false;
        user.twoFactorEnabled = true;
        await user.save();

        // Send deactivation email notification
        const mailOptions = {
            ...defaultMailOptions,
            to: user.email,
            subject: "Account Deactivation Notice - Agri-Waste Marketplace",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #2c3e50; margin-bottom: 10px;">Account Deactivation Notice</h1>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
                        <p style="color: #34495e; margin-bottom: 20px;">Dear ${user.name},</p>
                        
                        <p style="color: #34495e;">We regret to inform you that your account has been deactivated. This means you will no longer have access to the Agri-Waste Marketplace platform.</p>
                        
                        <p style="color: #34495e;">If you wish to reactivate your account, please login to your account using the button below:</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="http://localhost:5173/login" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Login into your Account</a>
                        </div>
                        
                        <p style="color: #34495e;">We look forward to having you back in our community!</p>
                    </div>
                    
                    <div style="text-align: center; color: #7f8c8d; font-size: 14px;">
                        <p>This is an automated message. Please do not reply to this email.</p>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
                        <p style="color: #7f8c8d; font-size: 12px;">© 2024 Agri-Waste Marketplace. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: "User account deactivated successfully" });

    } catch (err) {
        console.error("Error in deleteUser:", err);
        res.status(500).json({ message: err.message });
    }
};

export const getLoginHistory = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('loginHistory');
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Sort login history by timestamp in descending order (most recent first)
        const sortedHistory = user.loginHistory.sort((a, b) => b.timestamp - a.timestamp);
        
        res.json({ loginHistory: sortedHistory });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
};

export const toggleTwoFactorAuth = async (req, res) => {
  try {
    const { enable } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Record the 2FA toggle in login history
    user.loginHistory.push({
      ipAddress: req.ip,
      deviceInfo: req.headers['user-agent'],
      status: "success",
      action: `Two-factor authentication ${enable ? 'enabled' : 'disabled'}`
    });

    user.twoFactorEnabled = enable;
    user.lastSecurityUpdate = new Date();
    await user.save();

    res.json({ 
      msg: `Two-factor authentication ${enable ? 'enabled' : 'disabled'} successfully`,
      twoFactorEnabled: user.twoFactorEnabled 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
};

export const exportUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('name email phone role isVerified createdAt loginHistory');

        // CSV Header
        const csvHeader = 'Name,Email,Phone,Role,Verification Status,Created At,Last Login\n';

        // CSV Rows
        const csvRows = users.map(user => {
            // Get most recent successful login
            const lastLogin = user.loginHistory && user.loginHistory.length > 0
                ? user.loginHistory
                    .filter(login => login.status === 'success')
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
                : null;

            // Role Formatting
            const role =
                user.role === 'farmer' ? 'Farmer' :
                user.role === 'buyer' ? 'Buyer' :
                user.role === 'truck_driver' ? 'Truck Driver' :
                'ADMIN';

            return [
                `"${user.name || ''}"`,
                `"${user.email || ''}"`,
                `"${user.phone || ''}"`,
                `"${role}"`,
                `"${user.isVerified ? 'Verified' : 'Unverified'}"`,
                `"${new Date(user.createdAt).toLocaleString()}"`,
                `"${lastLogin ? new Date(lastLogin.timestamp).toLocaleString() : 'Never'}"`
            ].join(',');
        }).join('\n');

        const csvContent = csvHeader + csvRows;

        // Set Headers for download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=users.csv');

        // Send the file
        res.send(csvContent);

    } catch (err) {
        console.error('Error exporting users:', err);
        res.status(500).json({ message: 'Error exporting users' });
    }
};

export const refreshAccessToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ msg: "No refresh token provided" });
    }
    try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(payload.id);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ msg: "Invalid refresh token" });
        }
        const newAccessToken = generateAccessToken(user._id);
        res.json({ token: newAccessToken });
    } catch (err) {
        return res.status(403).json({ msg: "Invalid or expired refresh token" });
    }
};


