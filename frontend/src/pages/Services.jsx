import { motion } from 'framer-motion';
import { FaCalendarCheck, FaTools, FaBell, FaShieldAlt, FaChartLine, FaMobileAlt, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const Services = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Hero Image Section (Achievements Style) */}
      <div className="relative h-[40vh] min-h-[400px] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop" 
            alt="Our Services" 
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
          <div className="text-accent font-bold uppercase tracking-widest text-sm mb-4">What We Offer</div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Our Core Services</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
            Comprehensive solutions designed to streamline university operations and improve the daily campus experience.
          </p>
        </motion.div>
      </div>

      {/* FIX: Added relative and z-20 here, and changed to -mt-16 to pull it up correctly */}
      <div className="container mx-auto px-6 -mt-16 relative z-20">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {[
            { 
              icon: <FaCalendarCheck />, title: "Smart Resource Booking", 
              desc: "Automated conflict-checking and approval workflows for lecture halls, labs, and equipment.",
              color: "text-blue-500", bg: "bg-blue-50"
            },
            { 
              icon: <FaTools />, title: "Incident Management", 
              desc: "Quickly report damages with image attachments. Track resolution from OPEN to CLOSED.",
              color: "text-red-500", bg: "bg-red-50"
            },
            { 
              icon: <FaShieldAlt />, title: "Role-Based Access Control", 
              desc: "Secure OAuth 2.0 integration ensuring Students, Technicians, and Admins see only what they need.",
              color: "text-green-500", bg: "bg-green-50"
            },
            { 
              icon: <FaBell />, title: "Real-Time Notifications", 
              desc: "Instant alerts for booking approvals, ticket status changes, and administrative announcements.",
              color: "text-yellow-500", bg: "bg-yellow-50"
            },
            { 
              icon: <FaChartLine />, title: "Usage Analytics", 
              desc: "Detailed dashboards for administrators to track peak booking hours and top requested resources.",
              color: "text-purple-500", bg: "bg-purple-50"
            },
            { 
              icon: <FaMobileAlt />, title: "Responsive Interface", 
              desc: "A fully responsive React client application that works flawlessly on desktops, tablets, and smartphones.",
              color: "text-cyan-500", bg: "bg-cyan-50"
            }
          ].map((service, index) => (
            <motion.div 
              key={index}
              variants={fadeInUp}
              className="bg-white p-10 rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 ${service.bg} ${service.color} group-hover:scale-110 transition-transform`}>
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{service.title}</h3>
              <p className="text-gray-600 leading-relaxed mb-6">{service.desc}</p>
              <Link to="/facilities" className={`inline-flex items-center gap-2 font-bold hover:gap-4 transition-all ${service.color}`}>
                Learn More <FaArrowRight />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Services;