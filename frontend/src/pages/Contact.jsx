import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaArrowRight, FaTicketAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const Contact = () => {

  // --- අලුතින් එකතු කරපු කෑල්ල ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);
  // ------------------------------


  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Hero Image Section (Unified Style) */}
      <div className="relative h-[40vh] min-h-[400px] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1596524430615-b46475ddff6e?q=80&w=2070&auto=format&fit=crop" 
            alt="Contact Support" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/90 mix-blend-multiply" /> 
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center text-white px-6"
        >
          <div className="text-accent font-bold uppercase tracking-widest text-sm mb-4">Get In Touch</div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Contact IT Support</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
            We are here to assist you. Reach out to the campus administration or IT helpdesk for general inquiries.
          </p>
        </motion.div>
      </div>

      <div className="container mx-auto px-6 -mt-16 relative z-20">
        
        {/* Contact Info Cards Grid */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {[
            { icon: <FaMapMarkerAlt />, title: "Visit Us", details: ["Faculty of Computing", "SLIIT Campus, Malabe"], color: "text-blue-500", bg: "bg-blue-50" },
            { icon: <FaPhone />, title: "Call Us", details: ["+94 11 234 5678", "+94 77 123 4567"], color: "text-green-500", bg: "bg-green-50" },
            { icon: <FaEnvelope />, title: "Email Us", details: ["support@smartcampus.lk", "admin@smartcampus.lk"], color: "text-accent", bg: "bg-yellow-50" },
            { icon: <FaClock />, title: "Working Hours", details: ["Monday - Friday", "8:00 AM - 5:30 PM"], color: "text-purple-500", bg: "bg-purple-50" }
          ].map((item, index) => (
            <motion.div 
              key={index}
              variants={fadeInUp}
              className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center hover:-translate-y-2 transition-transform duration-300"
            >
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl mb-6 ${item.bg} ${item.color}`}>
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">{item.title}</h3>
              <div className="text-gray-600 space-y-1 font-medium">
                {item.details.map((line, i) => <p key={i}>{line}</p>)}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Action Panel (Replacing the Form) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid lg:grid-cols-3 gap-0 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Left Side: Notice to Login / Go to Dashboard */}
          <div className="lg:col-span-1 bg-primary p-12 text-white flex flex-col justify-center">
            <FaTicketAlt className="text-5xl text-accent mb-6" />
            
            <h2 className="text-3xl font-bold mb-4">
              {isLoggedIn ? "Ready to report an issue?" : "Need to report an issue?"}
            </h2>
            
            <p className="text-gray-300 leading-relaxed mb-8 text-lg font-light">
              {isLoggedIn 
                ? "Head over to your dashboard to securely submit maintenance tickets, equipment faults, and facility booking requests." 
                : "Maintenance tickets, equipment faults, and facility booking requests are processed securely through the SmartCampus Dashboard. Please log in with your university credentials to submit a request."}
            </p>
            
            <Link 
              to={isLoggedIn ? "/profile" : "/login"} 
              className="inline-flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 rounded-xl font-bold hover:bg-yellow-600 transition-colors shadow-lg w-max"
            >
              {isLoggedIn ? "Go to Dashboard" : "Log In to Portal"} <FaArrowRight />
            </Link>
          </div>

          {/* Right Side: Visual/Map Representation */}
          <div className="lg:col-span-2 min-h-[400px] relative">
            <img 
              src="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2066&auto=format&fit=crop" 
              alt="Campus Map" 
              className="w-full h-full object-cover"
            />
            {/* Overlay Gradient to make it look premium */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent lg:from-primary/90 lg:via-primary/20 lg:to-transparent" />
            
            <div className="absolute bottom-8 left-8 lg:left-12 max-w-sm">
               <div className="bg-white/90 backdrop-blur p-6 rounded-2xl shadow-xl border border-white/20">
                 <h3 className="font-bold text-gray-800 text-lg mb-2">Main IT Hub</h3>
                 <p className="text-gray-600 text-sm">Located at the Ground Floor of the Main Computing Block. Walk-ins are welcome during working hours.</p>
               </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Contact;