import React from "react";
import { motion } from "framer-motion";
import { 
  FaStar, 
  FaQuoteLeft, 
  FaUserCircle,
  FaBus,
  FaShieldAlt,
  FaHeart
} from "react-icons/fa";
import { 
  IoTime,
  IoCheckmarkCircle,
  IoRibbon
} from "react-icons/io5";

const reviews = [
  { 
    id: 1, 
    name: "Amal Perera", 
    comment: "Exceptional service! The luxury bus was spotless and the driver was extremely professional. Made our family trip to Kandy absolutely comfortable.", 
    rating: 5,
    date: "2 days ago",
    tripType: "Family Vacation"
  },
  { 
    id: 2, 
    name: "Nimal Fernando", 
    comment: "Reliable and punctual service. The executive van was perfect for our business delegation. Will definitely use again for corporate events.", 
    rating: 4,
    date: "1 week ago",
    tripType: "Business Trip"
  },
  { 
    id: 3, 
    name: "Kavindu Rajapaksha", 
    comment: "Absolutely the best transport service for weddings! The premium car arrived on time and was decorated beautifully. Made our special day even more memorable.", 
    rating: 5,
    date: "3 weeks ago",
    tripType: "Wedding Event"
  },
  {
    id: 4,
    name: "Samantha Silva",
    comment: "Outstanding experience! The driver was courteous and the vehicle was in perfect condition. Perfect for airport transfers.",
    rating: 5,
    date: "1 month ago",
    tripType: "Airport Transfer"
  }
];

const stats = [
  { icon: FaBus, value: "500+", label: "Trips Completed" },
  { icon: FaStar, value: "4.9/5", label: "Customer Rating" },
  { icon: IoRibbon, value: "98%", label: "Satisfaction Rate" },
  { icon: FaShieldAlt, value: "100%", label: "Safety Record" }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const reviewVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { 
      duration: 0.6, 
      ease: "easeOut",
      type: "spring",
      stiffness: 100
    } 
  },
  hover: {
    scale: 1.03,
    y: -5,
    boxShadow: "0 20px 40px rgba(59, 130, 246, 0.15)",
    transition: { duration: 0.3, ease: "easeOut" }
  },
};

const starVariants = {
  hover: { scale: 1.2, rotate: 10, transition: { duration: 0.2 } }
};

export const Reviews = () => {
  return (
    <motion.section
      id="reviews"
      className="py-16 bg-gradient-to-b from-blue-50 to-white relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background decorative elements */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-6 shadow-lg"
            whileHover={{ rotate: 5, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FaQuoteLeft className="text-2xl text-white" />
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Trusted by <span className="text-blue-500">Thousands</span> of Travelers
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover why customers choose Rajapaksha Transport for their journey needs
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center p-6 bg-white rounded-xl shadow-md border border-gray-100"
              variants={reviewVariants}
              whileHover="hover"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="text-2xl text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-blue-500 mb-2">{stat.value}</div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Reviews Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              className="relative bg-white rounded-2xl shadow-lg p-8 border border-gray-100 overflow-hidden group"
              variants={reviewVariants}
              whileHover="hover"
            >
              {/* Decorative gradient corner */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-400 rounded-bl-full opacity-80"></div>
              
              {/* Quote icon */}
              <FaQuoteLeft className="text-blue-600 text-3xl mb-6 opacity-80" />

              {/* Rating stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    variants={starVariants}
                    whileHover="hover"
                  >
                    <FaStar className={`text-lg ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  </motion.div>
                ))}
              </div>

              {/* Comment */}
              <p className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                "{review.comment}"
              </p>

              {/* Reviewer info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUserCircle className="text-2xl text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{review.name}</p>
                    <p className="text-sm text-gray-500">{review.tripType}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <IoTime className="text-blue-500" />
                    <span>{review.date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <IoCheckmarkCircle />
                    <span>Verified Trip</span>
                  </div>
                </div>
              </div>

              {/* Hover effect overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                whileHover={{ opacity: 1 }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white shadow-2xl">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Experience Premium Travel?
            </h3>
            <p className="text-blue-100 text-lg mb-6 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust us for their transportation needs
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition"
            >
              Book Your Ride Now
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};