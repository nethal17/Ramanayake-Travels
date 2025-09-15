import React from 'react';
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-500 to-blue-700 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 
            className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
          >
            About Ramanayaka Transport
          </h1>
          <p 
            className="mt-6 text-xl max-w-3xl mx-auto"
          >
            Your trusted partner in transportation for over 15 years. Delivering excellence, safety, and reliability in every journey.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="text-center p-6 bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex justify-center mb-4">
                  {stat.icon}
                </div>
                <h3 className="text-4xl font-bold text-gray-900">{stat.number}</h3>
                <p className="mt-2 text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-1 lg:gap-16 items-center">
            <div>
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
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="text-center"
          >
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Our Values</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              These core values guide everything we do at Ramanayaka Transport and shape our company culture.
            </p>
          </div>

          <div 
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-gray-50 p-8 rounded-lg text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex justify-center">
                  {value.icon}
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">{value.title}</h3>
                <p className="mt-4 text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 
            className="text-3xl font-extrabold sm:text-4xl"
          >
            Ready to Experience the Ramanayaka Difference?
          </h2>
          <p 
            className="mt-4 text-xl max-w-3xl mx-auto"
          >
            Join thousands of satisfied customers who trust us for their transportation needs.
          </p>
          <div 
            className="mt-10"
          >
            <a
              href="/contactus"
              className="inline-block bg-white text-blue-600 font-bold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;