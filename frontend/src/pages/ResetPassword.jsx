import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "password") {
      setPassword(value);
    } else if (name === "confirmPassword") {
      setConfirmPassword(value);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await axios.post(`http://localhost:5001/api/auth/reset-password/${token}`, { password });
      toast.success("Password successfully reset.");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to reset password.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white mt-6">
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md px-8 py-10 mx-4 bg-white rounded-3xl shadow-2xl backdrop-blur-sm border border-white/20">
          {/* Decorative top border */}
          <div className="absolute top-0 left-0 w-full h-2 bg-blue-500 rounded-t-3xl"></div>
          
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-blue-500">
              Reset Password
            </h2>
            <p className="mt-2 text-gray-500">Create a new password for your account</p>
          </div>
          
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <svg
                  className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <svg
                  className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 text-lg font-medium text-white rounded-xl shadow-md transition-all duration-300 ${
                loading 
                  ? "bg-blue-500 cursor-not-allowed"
                  : "bg-blue-500 hover:shadow-lg transform hover:-translate-y-0.5"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Remembered your password?
                </span>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <a
                href="/login"
                className="inline-flex items-center text-sm font-medium text-blue-500 hover:text-blue-500 hover:underline"
              >
                Back to Sign In
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;