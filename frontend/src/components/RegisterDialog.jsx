import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { 
  RiCloseLine, 
  RiMailLine, 
  RiLockLine, 
  RiUserLine,
  RiPhoneLine,
  RiBusLine
} from "react-icons/ri";

export const RegisterDialog = ({ open, onClose, onSwitchToLogin }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const dialogRef = useRef(null);
  const firstFieldRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    if (open) {
      document.addEventListener("keydown", onKey);
      setTimeout(() => firstFieldRef.current?.focus(), 0);
    }
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setErrors({});
      setTouched({});
    }
  }, [open]);

  // Validation functions
  const validateName = (value) => {
    if (!value.trim()) return "Full name is required";
    if (value.trim().length < 2) return "Name must be at least 2 characters";
    if (value.trim().length > 50) return "Name must be less than 50 characters";
    if (!/^[a-zA-Z\s]+$/.test(value.trim())) return "Name can only contain letters and spaces";
    return "";
  };

  const validateEmail = (value) => {
    if (!value.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Please enter a valid email address";
    return "";
  };

  const validatePhone = (value) => {
    if (!value.trim()) return "Phone number is required";
    const phoneRegex = /^0[0-9]{9}$/; // Sri Lankan phone format: 0XXXXXXXXX
    if (!phoneRegex.test(value)) return "Please enter a valid 10-digit phone number starting with 0";
    return "";
  };

  const validatePassword = (value) => {
    if (!value) return "Password is required";
    if (value.length < 6) return "Password must be at least 6 characters";
    if (value.length > 128) return "Password must be less than 128 characters";
    if (!/(?=.*[a-z])/.test(value)) return "Password must contain at least one lowercase letter";
    if (!/(?=.*[A-Z])/.test(value)) return "Password must contain at least one uppercase letter";
    if (!/(?=.*\d)/.test(value)) return "Password must contain at least one number";
    return "";
  };

  // Real-time validation
  const validateField = (fieldName, value) => {
    let error = "";
    switch (fieldName) {
      case "name":
        error = validateName(value);
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "phone":
        error = validatePhone(value);
        break;
      case "password":
        error = validatePassword(value);
        break;
      default:
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
    
    return error === "";
  };

  // Handle field changes with validation
  const handleFieldChange = (fieldName, value) => {
    switch (fieldName) {
      case "name":
        setName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "phone":
        // Only allow numeric input for phone
        const numericValue = value.replace(/\D/g, "");
        if (numericValue.length <= 10) {
          setPhone(numericValue);
        }
        break;
      case "password":
        setPassword(value);
        break;
      default:
        break;
    }

    // Validate if field has been touched
    if (touched[fieldName]) {
      validateField(fieldName, fieldName === "phone" ? value.replace(/\D/g, "") : value);
    }
  };

  // Handle field blur
  const handleFieldBlur = (fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
    
    const value = fieldName === "name" ? name : 
                 fieldName === "email" ? email :
                 fieldName === "phone" ? phone :
                 fieldName === "password" ? password : "";
    
    validateField(fieldName, value);
  };

  const onBackdropClick = (e) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target)) onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true
    });

    // Validate all fields
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const phoneError = validatePhone(phone);
    const passwordError = validatePassword(password);

    const newErrors = {
      name: nameError,
      email: emailError,
      phone: phoneError,
      password: passwordError
    };

    setErrors(newErrors);

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(error => error !== "");
    
    if (hasErrors) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setLoading(true);
    try {
      const role = "customer";
      const { data } = await axios.post(
        "http://localhost:5001/api/auth/register",
        { name: name.trim(), email: email.trim(), phone, password, role },
        { withCredentials: true }
      );
      toast.success(data?.msg || "Registered. Check your email to verify.");
      onClose?.();
      onSwitchToLogin?.();
    } catch (err) {
      const msg = err?.response?.data?.msg || err?.response?.data?.message || "Registration failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/80 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="register-dialog-title"
          onMouseDown={onBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            ref={dialogRef}
            className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header with blue accent */}
            <div className="h-2 w-full bg-blue-500" />
            
            {/* Header */}
            <div className="px-8 pt-8 pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <RiBusLine className="text-white text-xl" />
                  </div>
                  <h2 id="register-dialog-title" className="text-2xl font-bold text-gray-900">
                    Create Account
                  </h2>
                </div>
                <motion.button
                  type="button"
                  onClick={onClose}
                  aria-label="Close register dialog"
                  className="inline-flex items-center justify-center rounded-full p-2 text-gray-900 hover:bg-gray-900/5 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <RiCloseLine size={22} />
                </motion.button>
              </div>
              <p className="mt-2 text-sm text-gray-900/70">
                Join Ramanayaka Transport in just a few steps
              </p>
            </div>

            {/* Body */}
            <div className="px-8 pb-8 pt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-900">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <RiUserLine className={`h-5 w-5 ${errors.name ? 'text-red-500' : 'text-gray-900/50'}`} />
                    </div>
                    <input
                      id="name"
                      ref={firstFieldRef}
                      type="text"
                      value={name}
                      onChange={(e) => handleFieldChange("name", e.target.value)}
                      onBlur={() => handleFieldBlur("name")}
                      className={`w-full rounded-lg border pl-10 pr-4 py-3 text-gray-900 placeholder-gray-900/40 outline-none focus:ring-2 focus:border-transparent transition-all ${
                        errors.name 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-900/20 focus:ring-blue-500'
                      }`}
                      placeholder="John Doe"
                      aria-describedby={errors.name ? "name-error" : undefined}
                    />
                  </div>
                  {errors.name && touched.name && (
                    <motion.p
                      id="name-error"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600"
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </motion.div>

                {/* Email Field */}
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <RiMailLine className={`h-5 w-5 ${errors.email ? 'text-red-500' : 'text-gray-900/50'}`} />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => handleFieldChange("email", e.target.value)}
                      onBlur={() => handleFieldBlur("email")}
                      className={`w-full rounded-lg border pl-10 pr-4 py-3 text-gray-900 placeholder-gray-900/40 outline-none focus:ring-2 focus:border-transparent transition-all ${
                        errors.email 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-900/20 focus:ring-blue-500'
                      }`}
                      placeholder="you@example.com"
                      aria-describedby={errors.email ? "email-error" : undefined}
                    />
                  </div>
                  {errors.email && touched.email && (
                    <motion.p
                      id="email-error"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </motion.div>

                {/* Phone Field */}
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-900">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <RiPhoneLine className={`h-5 w-5 ${errors.phone ? 'text-red-500' : 'text-gray-900/50'}`} />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      title="10-digit phone number starting with 0"
                      value={phone}
                      onChange={(e) => handleFieldChange("phone", e.target.value)}
                      onBlur={() => handleFieldBlur("phone")}
                      maxLength={10}
                      className={`w-full rounded-lg border pl-10 pr-4 py-3 text-gray-900 placeholder-gray-900/40 outline-none focus:ring-2 focus:border-transparent transition-all ${
                        errors.phone 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-900/20 focus:ring-blue-500'
                      }`}
                      placeholder="0771234567"
                      aria-describedby={errors.phone ? "phone-error" : undefined}
                    />
                  </div>
                  {errors.phone && touched.phone && (
                    <motion.p
                      id="phone-error"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600"
                    >
                      {errors.phone}
                    </motion.p>
                  )}
                </motion.div>

                {/* Password Field */}
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-900">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <RiLockLine className={`h-5 w-5 ${errors.password ? 'text-red-500' : 'text-gray-900/50'}`} />
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => handleFieldChange("password", e.target.value)}
                      onBlur={() => handleFieldBlur("password")}
                      className={`w-full rounded-lg border pl-10 pr-4 py-3 text-gray-900 placeholder-gray-900/40 outline-none focus:ring-2 focus:border-transparent transition-all ${
                        errors.password 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-900/20 focus:ring-blue-500'
                      }`}
                      placeholder="••••••••"
                      aria-describedby={errors.password ? "password-error" : undefined}
                    />
                  </div>
                  {errors.password && touched.password && (
                    <motion.p
                      id="password-error"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600"
                    >
                      {errors.password}
                    </motion.p>
                  )}
                  {/* Password Requirements */}
                  {touched.password && !errors.password && password && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-xs text-gray-600"
                    >
                      <p>Password requirements:</p>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        <li className={password.length >= 6 ? 'text-green-600' : 'text-gray-600'}>
                          At least 6 characters
                        </li>
                        <li className={/(?=.*[a-z])/.test(password) ? 'text-green-600' : 'text-gray-600'}>
                          One lowercase letter
                        </li>
                        <li className={/(?=.*[A-Z])/.test(password) ? 'text-green-600' : 'text-gray-600'}>
                          One uppercase letter
                        </li>
                        <li className={/(?=.*\d)/.test(password) ? 'text-green-600' : 'text-gray-600'}>
                          One number
                        </li>
                      </ul>
                    </motion.div>
                  )}
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-blue-500 px-4 py-3 font-medium text-white shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 transition-colors"
                    whileHover={!loading ? { scale: 1.02 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </motion.button>
                </motion.div>

                {/* Login Link */}
                <motion.div 
                  className="text-center pt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <p className="text-sm text-gray-900/70">
                    Already have an account?{" "}
                    <motion.button 
                      type="button" 
                      className="text-blue-500 font-medium hover:text-blue-600 hover:underline transition-colors"
                      onClick={() => { onClose?.(); onSwitchToLogin?.(); }}
                      whileHover={{ x: 2 }}
                    >
                      Sign in
                    </motion.button>
                  </p>
                </motion.div>
              </form>
            </div>

            {/* Footer decoration */}
            <div className="h-2 w-full bg-blue-500" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};