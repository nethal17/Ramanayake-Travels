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

  const onBackdropClick = (e) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target)) onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const role = "customer";
      const { data } = await axios.post(
        "http://localhost:5001/api/auth/register",
        { name, email, phone, password, role },
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
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <RiUserLine className="h-5 w-5 text-gray-900/50" />
                    </div>
                    <input
                      id="name"
                      ref={firstFieldRef}
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-900/20 pl-10 pr-4 py-3 text-gray-900 placeholder-gray-900/40 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                </motion.div>

                {/* Email Field */}
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <RiMailLine className="h-5 w-5 text-gray-900/50" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-900/20 pl-10 pr-4 py-3 text-gray-900 placeholder-gray-900/40 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                </motion.div>

                {/* Phone Field */}
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-900">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <RiPhoneLine className="h-5 w-5 text-gray-900/50" />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      title="10-digit phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-900/20 pl-10 pr-4 py-3 text-gray-900 placeholder-gray-900/40 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="07XXXXXXXX"
                    />
                  </div>
                </motion.div>

                {/* Password Field */}
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-900">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <RiLockLine className="h-5 w-5 text-gray-900/50" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full rounded-lg border border-gray-900/20 pl-10 pr-4 py-3 text-gray-900 placeholder-gray-900/40 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                  </div>
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
            <div className="h-2 w-full bg-blue-500 opacity-70" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};