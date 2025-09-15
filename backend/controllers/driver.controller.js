import User from '../models/user.model.js';
import Driver from '../models/driver.model.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendEmail } from '../lib/nodemailer.js';
import path from 'path';
import fs from 'fs';

// Generate random password
const generatePassword = () => {
    const length = 8;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
};

// Create driver
export const createDriver = async (req, res) => {
    try {
        const { name, email, age, address, phone } = req.body;

        const existingUser = await User.findOne({ 
            $or: [{ email }, { phone }] 
        });
        
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email or phone already exists"
            });
        }

        if (!req.files || !req.files.frontLicense || !req.files.backLicense) {
            return res.status(400).json({
                success: false,
                message: "Both front and back images of driving license are required"
            });
        }

        const autoPassword = generatePassword();
        const hashedPassword = await bcrypt.hash(autoPassword, 12);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            role: 'driver',
            verificationToken,
            isVerified: false
        });

        const savedUser = await user.save();

        const driver = new Driver({
            userId: savedUser._id,
            age: parseInt(age),
            address,
            drivingLicense: {
                frontImage: req.files.frontLicense[0].filename,
                backImage: req.files.backLicense[0].filename
            }
        });

        await driver.save();

        const verificationLink = `http://localhost:5001/api/auth/verify-email/${verificationToken}`;
        
        const emailContent = `
            <h2>Welcome to Ramanayake Travels!</h2>
            <p>Dear ${name},</p>
            <p>You are now a driver in our system. Please verify your email address to complete your registration.</p>
            <p>Click the link below to verify your email:</p>
            <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">Verify Email</a>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>${verificationLink}</p>
            <p>After verification, you will receive your login credentials.</p>
            <br>
            <p>Best regards,</p>
            <p>Ramanayake Travels Team</p>
        `;

        await sendEmail({
            to: email,
            subject: 'Welcome to Ramanayake Travels - Please Verify Your Email',
            html: emailContent
        });

        savedUser.twoStepVerificationCode = autoPassword;
        await savedUser.save();

        res.status(201).json({
            success: true,
            message: "Driver created successfully. Verification email sent.",
            data: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                phone: savedUser.phone,
                role: savedUser.role
            }
        });

    } catch (error) {
        console.error('Create driver error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to create driver",
            error: error.message
        });
    }
};

// Get all drivers
export const getAllDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find()
            .populate('userId', 'name email phone isVerified createdAt')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: drivers
        });
    } catch (error) {
        console.error('Get drivers error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch drivers",
            error: error.message
        });
    }
};

// Get driver by ID
export const getDriverById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const driver = await Driver.findById(id)
            .populate('userId', 'name email phone isVerified createdAt')
            .populate('assignedVehicles');

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Driver not found"
            });
        }

        res.status(200).json({
            success: true,
            data: driver
        });
    } catch (error) {
        console.error('Get driver error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch driver",
            error: error.message
        });
    }
};

// Update driver status
export const updateDriverStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const driver = await Driver.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        ).populate('userId', 'name email phone');

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Driver not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Driver status updated successfully",
            data: driver
        });
    } catch (error) {
        console.error('Update driver status error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to update driver status",
            error: error.message
        });
    }
};

// Update driver details
export const updateDriver = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, age, address, phone } = req.body;

        const driver = await Driver.findById(id).populate('userId');
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Driver not found"
            });
        }

        if (email !== driver.userId.email || phone !== driver.userId.phone) {
            const existingUser = await User.findOne({
                $and: [
                    { _id: { $ne: driver.userId._id } },
                    { $or: [{ email }, { phone }] }
                ]
            });
            
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "User with this email or phone already exists"
                });
            }
        }

        const driverUpdateData = {
            age: parseInt(age),
            address
        };

        if (req.files) {
            if (req.files.frontLicense && req.files.frontLicense[0]) {
                if (driver.drivingLicense.frontImage) {
                    const oldFrontPath = path.join(process.cwd(), 'uploads', driver.drivingLicense.frontImage);
                    if (fs.existsSync(oldFrontPath)) {
                        fs.unlinkSync(oldFrontPath);
                    }
                }
                driverUpdateData['drivingLicense.frontImage'] = req.files.frontLicense[0].filename;
            }

            if (req.files.backLicense && req.files.backLicense[0]) {
                if (driver.drivingLicense.backImage) {
                    const oldBackPath = path.join(process.cwd(), 'uploads', driver.drivingLicense.backImage);
                    if (fs.existsSync(oldBackPath)) {
                        fs.unlinkSync(oldBackPath);
                    }
                }
                driverUpdateData['drivingLicense.backImage'] = req.files.backLicense[0].filename;
            }
        }

        await User.findByIdAndUpdate(
            driver.userId._id,
            { name, email, phone },
            { new: true, runValidators: true }
        );

        const updatedDriver = await Driver.findByIdAndUpdate(
            id,
            driverUpdateData,
            { new: true, runValidators: true }
        ).populate('userId', 'name email phone isVerified');

        res.status(200).json({
            success: true,
            message: "Driver updated successfully",
            data: updatedDriver
        });

    } catch (error) {
        console.error('Update driver error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to update driver",
            error: error.message
        });
    }
};

// Delete driver
export const deleteDriver = async (req, res) => {
    try {
        const { id } = req.params;

        const driver = await Driver.findById(id);
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Driver not found"
            });
        }

        const frontImagePath = path.join(process.cwd(), 'uploads', driver.drivingLicense.frontImage);
        const backImagePath = path.join(process.cwd(), 'uploads', driver.drivingLicense.backImage);
        
        [frontImagePath, backImagePath].forEach(imagePath => {
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        });

        await Driver.findByIdAndDelete(id);
        
        await User.findByIdAndDelete(driver.userId);

        res.status(200).json({
            success: true,
            message: "Driver deleted successfully"
        });
    } catch (error) {
        console.error('Delete driver error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to delete driver",
            error: error.message
        });
    }
};

// Send password after email verification
export const sendPasswordAfterVerification = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user || !user.isVerified) {
            return;
        }

        const password = user.twoStepVerificationCode;
        
        const emailContent = `
            <h2>Your Login Credentials - Ramanayake Travels</h2>
            <p>Dear ${user.name},</p>
            <p>Thank you for verifying your email. Here are your login credentials:</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Password:</strong> ${password}</p>
            </div>
            <p>Please keep these credentials safe and change your password after your first login.</p>
            <p>You can now log in to the system using these credentials.</p>
            <br>
            <p>Best regards,</p>
            <p>Ramanayake Travels Team</p>
        `;

        await sendEmail({
            to: user.email,
            subject: 'Your Login Credentials - Ramanayake Travels',
            html: emailContent
        });

        user.twoStepVerificationCode = null;
        await user.save();

    } catch (error) {
        console.error('Send password email error:', error);
    }
};

// Get driver profile - for driver users to see their own profile
export const getDriverProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        
        console.log('Getting driver profile for user:', userId);
        
        const driver = await Driver.findOne({ userId });
        
        if (!driver) {
            console.log('No driver profile found for userId:', userId);
            return res.status(404).json({
                success: false,
                message: "Driver profile not found"
            });
        }
        
        console.log('Driver profile found:', driver._id);
        
        return res.status(200).json({
            success: true,
            ...driver.toObject()
        });
    } catch (error) {
        console.error("Error getting driver profile:", error);
        return res.status(500).json({
            success: false,
            message: "Error retrieving driver profile",
            error: error.message
        });
    }
};

// Update driver availability
export const updateDriverAvailability = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const { availability } = req.body;
        
        if (typeof availability !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: "Availability must be a boolean value"
            });
        }
        
        const driver = await Driver.findOneAndUpdate(
            { userId },
            { availability },
            { new: true }
        );
        
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Driver profile not found"
            });
        }
        
        return res.status(200).json({
            success: true,
            message: `Driver availability updated to ${availability ? 'available' : 'unavailable'}`,
            driver
        });
    } catch (error) {
        console.error("Error updating driver availability:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating driver availability",
            error: error.message
        });
    }
};
