import React, { useState } from 'react';
import { 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaClock, 
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div 
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl">
            Get in Touch
          </h1>
          <p className="mt-5 text-xl text-gray-500 max-w-2xl mx-auto">
            We're here to help with all your transportation needs. Reach out to us anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            {[
              { icon: <FaPhone />, title: 'Phone', lines: ['+94 11 234 5678', '+94 77 123 4567'] },
              { icon: <FaEnvelope />, title: 'Email', lines: ['info@ramanayakatransport.lk', 'bookings@ramanayakatransport.lk'] },
              { icon: <FaMapMarkerAlt />, title: 'Address', lines: ['123 Transport Avenue', 'Colombo 05', 'Sri Lanka'] },
              { icon: <FaClock />, title: 'Business Hours', lines: ['Mon-Fri: 8:00 AM - 8:00 PM', 'Weekends: 8:00 AM - 6:00 PM'] }
            ].map((info, idx) => (
              <div 
                key={idx}
                className="flex bg-white shadow-lg rounded-2xl p-6 hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="flex-shrink-0">
                  <div className="h-14 w-14 flex items-center justify-center rounded-xl bg-blue-500 text-white text-2xl">
                    {info.icon}
                  </div>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-semibold text-gray-900">{info.title}</h3>
                  <div className="mt-1 text-gray-500 space-y-0.5">
                    {info.lines.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Map placeholder */}
            <div 
              className="mt-8 rounded-2xl overflow-hidden shadow-lg"
            >
              <div className="h-64 bg-gray-200 flex items-center justify-center rounded-2xl">
                <p className="text-gray-500">Interactive Map Here</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div 
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="px-8 py-10 sm:px-10 sm:py-12">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">Send us a Message</h2>
              <p className="text-center text-gray-500 mb-8">We'll get back to you as soon as possible.</p>

              {submitStatus === 'success' && (
                <div 
                  className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center"
                >
                  <FaCheckCircle className="mr-2" /> Thank you! We'll be in touch soon.
                </div>
              )}
              {submitStatus === 'error' && (
                <div 
                  className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center"
                >
                  <FaExclamationCircle className="mr-2" /> Error sending message. Try again.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text" name="name" placeholder="Full Name" required
                    value={formData.name} onChange={handleChange}
                    className="px-4 py-3 border border-gray-300 rounded-xl shadow-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <input
                    type="email" name="email" placeholder="Email Address" required
                    value={formData.email} onChange={handleChange}
                    className="px-4 py-3 border border-gray-300 rounded-xl shadow-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="tel" name="phone" placeholder="Phone Number"
                    value={formData.phone} onChange={handleChange}
                    className="px-4 py-3 border border-gray-300 rounded-xl shadow-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <input
                    type="text" name="subject" placeholder="Subject" required
                    value={formData.subject} onChange={handleChange}
                    className="px-4 py-3 border border-gray-300 rounded-xl shadow-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <textarea
                  name="message" rows={5} placeholder="Message" required
                  value={formData.message} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg transition duration-200"
                >
                  {isSubmitting ? (
                    <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : <FaPaperPlane className="mr-2" />}
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div 
          className="mt-20"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { q: "How far in advance should I book?", a: "We recommend booking at least 3-5 days in advance for standard services. For weddings and special events, 2-3 weeks notice is ideal." },
              { q: "What payment methods do you accept?", a: "We accept cash, bank transfers, and all major credit cards. Corporate accounts can also be set up for regular services." },
              { q: "Do you provide drivers?", a: "Yes, all our vehicles come with professional, licensed drivers. Our drivers are trained in safety protocols and customer service." },
              { q: "What if I need to cancel my booking?", a: "Cancellations made 48 hours in advance receive a full refund. Between 24-48 hours, a 50% refund is provided. Less than 24 hours notice is non-refundable." }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <h3 className="text-lg font-semibold text-blue-500 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
