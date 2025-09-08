import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { RiCloseLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

export const LoginDialog = ({ open, onClose, onOpenRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        toast.success("Logged in");
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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-dialog-title"
      onMouseDown={onBackdropClick}
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-md rounded-2xl bg-gray-100 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="h-4 w-full rounded-t-2xl bg-blue-500" />
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-1">
          <h2 id="login-dialog-title" className="text-2xl font-semibold text-gray-900 text-center">
            Welcome back
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close login dialog"
            className="inline-flex items-center justify-center rounded-full p-2 text-gray-900 hover:bg-gray-100"
          >
            <RiCloseLine size={22} />
          </button>
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

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-blue-500 px-4 py-2.5 font-medium text-white shadow hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <div className="text-sm text-gray-900/70 text-center">
                New here? {" "}
                <button type="button" className="text-blue-500 hover:underline hover:cursor-pointer" onClick={() => { onClose?.(); onOpenRegister?.(); }}>
                  Create account
                </button>
            </div>
          </form>
        </div>

        {/* Accent bar */}
        
      </div>
    </div>
  );
};
