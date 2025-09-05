import React from "react";
import { motion } from "framer-motion";
import { FaShieldAlt, FaClock, FaUserCheck, FaHeadset } from "react-icons/fa";

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      staggerChildren: 0.2,
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export const DetailsSection = () => {
  return (
    <motion.div
      id="details"
      className="mt-16 max-w-6xl mx-auto bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-2xl p-10 border border-gray-100 overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Title */}
      <motion.div className="flex items-center justify-center gap-3 mb-8" variants={childVariants}>
        <FaShieldAlt className="text-blue-600 text-3xl animate-pulse" />
        <h2 className="text-4xl font-extrabold text-blue-600 tracking-tight text-center">
          Why Choose Ramanayake Transport?
        </h2>
      </motion.div>

      {/* Description */}
      <motion.p
        className="text-center text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed"
        variants={childVariants}
      >
        We provide safe, reliable, and affordable transportation for weddings, staff transport, tourism packages, and more.
        With real-time booking, verified drivers, and responsive customer support, your journey is stress-free.
      </motion.p>

      {/* Features Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10"
        variants={containerVariants}
      >
        {/* Feature 1: Safety */}
        <motion.div
          className="flex flex-col items-center bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300"
          variants={childVariants}
          whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)" }}
        >
          <FaUserCheck className="text-blue-600 text-3xl mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Verified Drivers</h3>
          <p className="text-gray-500 text-center text-sm">
            Our drivers are thoroughly vetted for your safety and peace of mind.
          </p>
        </motion.div>

        {/* Feature 2: Real-Time Booking */}
        <motion.div
          className="flex flex-col items-center bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300"
          variants={childVariants}
          whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)" }}
        >
          <FaClock className="text-blue-600 text-3xl mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Real-Time Booking</h3>
          <p className="text-gray-500 text-center text-sm">
            Book your ride instantly with our seamless, real-time system.
          </p>
        </motion.div>

        {/* Feature 3: Support */}
        <motion.div
          className="flex flex-col items-center bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300"
          variants={childVariants}
          whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)" }}
        >
          <FaHeadset className="text-blue-600 text-3xl mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">24/7 Support</h3>
          <p className="text-gray-500 text-center text-sm">
            Our team is here to assist you anytime, ensuring a stress-free experience.
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};