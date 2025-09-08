import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { 
  RiCloseLine, 
  RiMailLine, 
  RiLockLine, 
  RiEyeLine, 
  RiEyeOffLine,
  RiBusLine
} from "react-icons/ri";
import { useNavigate } from "react-router-dom";

export const LoginDialog = ({ open, onClose, onOpenRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef(null);
  const firstFieldRef = useRef(null);
  const navigate = useNavigate();

  // Close on ESC and focus first field
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
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
      const { data } = await axios.post(
        "http://localhost:5001/api/auth/login",
        { email, password },
        { withCredentials: true }
      );

      if (data?.accessToken) {
        localStorage.setItem("token", data.accessToken);
        window.dispatchEvent(new Event("auth-changed"));
        toast.success("Logged in successfully!");
        onClose?.();
        navigate("/");
      } else if (data?.requiresVerification) {
        toast("2FA code sent to your email");
      } else {
        toast.error("Unexpected response");
      }
    } catch (err) {
      const msg = err?.response?.data?.msg || "Login failed";
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
          aria-labelledby="login-dialog-title"
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
                  <h2 id="login-dialog-title" className="text-2xl font-bold text-gray-900">
                    Welcome Back
                  </h2>
                </div>
                <motion.button
                  type="button"
                  onClick={onClose}
                  aria-label="Close login dialog"
                  className="inline-flex items-center justify-center rounded-full p-2 text-gray-900 hover:bg-gray-900/5 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <RiCloseLine size={22} />
                </motion.button>
              </div>
              <p className="mt-2 text-sm text-gray-900/70">
                Sign in to access your Ramanayaka Transport account
              </p>
            </div>

        {/* Body */}
        <div className="px-6 pb-6">
          <p className="mb-10 text-sm text-gray-900/50">
            Sign in to continue to Ramanayake Travels
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-900">
                Email
              </label>
              <input
                id="email"
                ref={firstFieldRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-500 outline-none ring-blue-500 transition focus:border-blue-500 focus:ring-1"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-900">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-500 outline-none ring-blue-500 transition focus:border-blue-500 focus:ring-1"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-900/70 pb-2">
                <a className="hover:underline" href="/forgot-password">Forgot password?</a>
              </div>
            </div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-blue-500 px-4 py-3 font-medium text-white shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 transition-colors"
                    whileHover={!loading ? { scale: 1.02 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </motion.button>
                </motion.div>

                {/* Register Link */}
                <motion.div 
                  className="text-center pt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="text-sm text-gray-900/70">
                    New to Ramanayaka Transport?{" "}
                    <motion.button 
                      type="button" 
                      className="text-blue-500 font-medium hover:text-blue-600 hover:underline transition-colors"
                      onClick={() => { onClose?.(); onOpenRegister?.(); }}
                      whileHover={{ x: 2 }}
                    >
                      Create an account
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