import React from "react";
import { motion } from "framer-motion";
import { 
  FaBus, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaClock,
  FaShieldAlt,
  FaAward,
  FaHeart,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaWhatsapp
} from "react-icons/fa";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const iconVariants = {
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: { duration: 0.3 }
  },
  tap: { scale: 0.95 }
};

const linkVariants = {
  hover: {
    x: 5,
    color: "#3B82F6",
    transition: { duration: 0.3 }
  }
};

export const Footer = () => {
  return (
    <motion.footer
      className="bg-gray-100 text-black pt-16 pb-8 px-4 md:px-8 overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Company info */}
          <motion.div className="flex flex-col" variants={itemVariants}>
            <motion.div 
              className="flex items-center gap-3 mb-6"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <FaBus className="text-xl text-white" />
              </div>
              <h3 className="text-2xl font-bold">Ramanayaka Transport</h3>
            </motion.div>
            <p className="text-gray-500 mb-6 leading-relaxed">
              Your trusted partner for premium transportation services across Sri Lanka. 
              Experience comfort, safety, and reliability on every journey.
            </p>
            
            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 mb-6">
              {[
                { icon: FaShieldAlt, label: "Insured", color: "text-blue-400" },
                { icon: FaAward, label: "Certified", color: "text-yellow-400" },
                { icon: FaClock, label: "24/7", color: "text-green-400" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg"
                  whileHover={{ y: -3 }}
                >
                  <item.icon className={`text-sm ${item.color}`} />
                  <span className="text-xs text-gray-300">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div className="flex flex-col" variants={itemVariants}>
            <h4 className="text-lg font-semibold mb-6 relative pb-2 after:absolute after:left-0 after:bottom-0 after:w-12 after:h-0.5 after:bg-blue-500">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {["Book a Ride", "Our Services", "Fleet", "Pricing", "About Us", "Contact"].map((link) => (
                <motion.li key={link} variants={linkVariants} whileHover="hover">
                  <a href="#" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    {link}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Information */}
          <motion.div className="flex flex-col" variants={itemVariants}>
            <h4 className="text-lg font-semibold mb-6 relative pb-2 after:absolute after:left-0 after:bottom-0 after:w-12 after:h-0.5 after:bg-blue-500">
              Contact Info
            </h4>
            <div className="space-y-4">
              <motion.div 
                className="flex items-start gap-3 group"
                whileHover={{ x: 5 }}
              >
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mt-1 group-hover:bg-blue-600 transition-colors">
                  <FaMapMarkerAlt className="text-white" />
                </div>
                <div>
                  <p className="text-gray-900 text-sm">Address</p>
                  <p className="text-gray-500">123 Transport Ave, Colombo, Sri Lanka</p>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-start gap-3 group"
                whileHover={{ x: 5 }}
              >
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mt-1 group-hover:bg-blue-600 transition-colors">
                  <FaPhone className="text-white" />
                </div>
                <div>
                  <p className="text-gray-900 text-sm">Phone</p>
                  <p className="text-gray-500">+94 11 234 5678</p>
                  <p className="text-gray-500">+94 77 123 4567</p>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-start gap-3 group"
                whileHover={{ x: 5 }}
              >
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mt-1 group-hover:bg-blue-600 transition-colors">
                  <FaEnvelope className="text-white" />
                </div>
                <div>
                  <p className="text-gray-900 text-sm">Email</p>
                  <p className="text-gray-500">info@ramanayakatransport.lk</p>
                  <p className="text-gray-500">bookings@ramanayakatransport.lk</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Newsletter & Social */}
          <motion.div className="flex flex-col" variants={itemVariants}>
            <h4 className="text-lg font-semibold mb-6 relative pb-2 after:absolute after:left-0 after:bottom-0 after:w-12 after:h-0.5 after:bg-blue-500">
              Stay Connected
            </h4>
            
            {/* Social Media */}
            <div className="mb-6">
              <p className="text-gray-500 text-sm mb-3">Follow us on social media</p>
              <div className="flex gap-3">
                {[
                  { Icon: FaFacebookF, color: "hover:bg-blue-600", href: "#" },
                  { Icon: FaTwitter, color: "hover:bg-sky-500", href: "#" },
                  { Icon: FaInstagram, color: "hover:bg-pink-600", href: "#" },
                  { Icon: FaLinkedinIn, color: "hover:bg-blue-700", href: "#" },
                  { Icon: FaYoutube, color: "hover:bg-red-600", href: "#" },
                  { Icon: FaWhatsapp, color: "hover:bg-green-500", href: "#" }
                ].map(({ Icon, color, href }, index) => (
                  <motion.a
                    key={index}
                    href={href}
                    className={`w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-white ${color} transition-colors`}
                    variants={iconVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Icon className="text-sm" />
                  </motion.a>
                ))}
              </div>
            </div>
            
            {/* Newsletter */}
            <div>
              <p className="text-gray-500 text-sm mb-3">Subscribe to our newsletter</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email address"
                  className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <motion.button 
                  className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Subscribe
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Copyright section */}
        <motion.div 
          className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          variants={itemVariants}
        >
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Ramanayaka Transport. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <motion.a href="#" whileHover={{ color: "#3B82F6" }} className="transition-colors">
              Privacy Policy
            </motion.a>
            <motion.a href="#" whileHover={{ color: "#3B82F6" }} className="transition-colors">
              Terms of Service
            </motion.a>
            <motion.a href="#" whileHover={{ color: "#3B82F6" }} className="transition-colors">
              FAQ
            </motion.a>
          </div>
          
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <span>Made with</span>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <FaHeart className="text-red-500" />
            </motion.span>
            <span>in Sri Lanka</span>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};