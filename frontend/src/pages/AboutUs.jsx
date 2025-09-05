import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaBus, 
  FaUsers, 
  FaAward, 
  FaMapMarkerAlt, 
  FaShieldAlt,
  FaHeart,
  FaClock,
  FaRibbon
} from 'react-icons/fa';

const AboutUs = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const stats = [
    { number: '15+', label: 'Years Experience', icon: <FaClock className="text-blue-500 text-2xl" /> },
    { number: '250+', label: 'Vehicles', icon: <FaBus className="text-blue-500 text-2xl" /> },
    { number: '100+', label: 'Professional Drivers', icon: <FaUsers className="text-blue-500 text-2xl" /> },
    { number: '50K+', label: 'Happy Customers', icon: <FaHeart className="text-blue-500 text-2xl" /> }
  ];

  const values = [
    {
      icon: <FaShieldAlt className="text-3xl text-blue-500" />,
      title: "Safety First",
      description: "We prioritize the safety of our passengers above all else with regular vehicle maintenance and trained drivers."
    },
    {
      icon: <FaUsers className="text-3xl text-blue-500" />,
      title: "Customer Centric",
      description: "Our customers are at the heart of everything we do. We strive to exceed expectations with every journey."
    },
    {
      icon: <FaRibbon className="text-3xl text-blue-500" />,
      title: "Excellence",
      description: "We're committed to excellence in service quality, vehicle maintenance, and customer experience."
    }
  ];

  const team = [
    {
      name: "Ramanayaka Perera",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80"
    },
    {
      name: "Samantha Silva",
      role: "Operations Manager",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=776&q=80"
    },
    {
      name: "Nimal Fernando",
      role: "Fleet Manager",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80"
    },
    {
      name: "Kamala Perera",
      role: "Customer Relations",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=761&q=80"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-500 to-blue-700 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            About Ramanayaka Transport
          </motion.h1>
          <motion.p 
            className="mt-6 text-xl max-w-3xl mx-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Your trusted partner in transportation for over 15 years. Delivering excellence, safety, and reliability in every journey.
          </motion.p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                className="text-center p-6 bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex justify-center mb-4">
                  {stat.icon}
                </div>
                <h3 className="text-4xl font-bold text-gray-900">{stat.number}</h3>
                <p className="mt-2 text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Our Story</h2>
              <p className="mt-4 text-lg text-gray-600">
                Founded in 2008, Ramanayaka Transport began as a small family business with just three buses. What started as a local transport service has now grown into one of Sri Lanka's most trusted transportation companies.
              </p>
              <p className="mt-4 text-lg text-gray-600">
                Our founder, Mr. Ramanayaka Perera, started this company with a simple vision: to provide safe, reliable, and affordable transportation to everyone. Today, we continue to uphold his values while embracing modern technology to serve our customers better.
              </p>
              <p className="mt-4 text-lg text-gray-600">
                From school trips and corporate events to weddings and tourism packages, we've been a part of countless special moments in our customers' lives. We're proud to have built a reputation for excellence and reliability over the years.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true }}
              className="mt-10 lg:mt-0"
            >
              <img 
                src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80" 
                alt="Our transport service" 
                className="rounded-lg shadow-xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Our Values</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              These core values guide everything we do at Ramanayaka Transport and shape our company culture.
            </p>
          </motion.div>

          <motion.div 
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {values.map((value, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                className="bg-gray-50 p-8 rounded-lg text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex justify-center">
                  {value.icon}
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">{value.title}</h3>
                <p className="mt-4 text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Our Leadership Team</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Meet the dedicated professionals who drive our company forward with passion and expertise.
            </p>
          </motion.div>

          <motion.div 
            className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {team.map((member, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-64 object-cover"
                />
                <div className="p-6 text-center">
                  <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-blue-500">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-3xl font-extrabold sm:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            Ready to Experience the Ramanayaka Difference?
          </motion.h2>
          <motion.p 
            className="mt-4 text-xl max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Join thousands of satisfied customers who trust us for their transportation needs.
          </motion.p>
          <motion.div 
            className="mt-10"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <motion.a
              href="/contactus"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block bg-white text-blue-600 font-bold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              Get in Touch
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;