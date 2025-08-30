import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Name is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"]
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        unique: true,
        trim: true,
        minlength: [10, "Phone number must be 10 digits"],
        maxlength: [10, "Phone number must be 10 digits"]
    },
    role: {
        type: String,
        enum: ["customer", "admin"],
        default: "customer"
    },
    profilePic: { type: String, default: "https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg" },
    resetPasswordToken: { 
        type: String 
    },
    resetPasswordExpire: { 
        type: Date 
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    }, 
    verificationToken: { 
        type: String 
    }, 
    twoStepVerificationCode: { 
        type: String 
    }, 
    twoStepVerificationExpire: { 
        type: Date 
    },
    twoFactorEnabled: { 
        type: Boolean, 
        default: false 
    },
    lastLogin: {
        timestamp: { type: Date, default: Date.now },
    },
    refreshToken: {
        type: String
    }
}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema);

export default User;