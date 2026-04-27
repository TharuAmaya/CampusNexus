import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FaArrowRight, FaStar, FaLaptopCode, FaTools, FaBell, FaQuoteRight, FaSearch, FaCalendarCheck, FaUserCheck } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const Home = () => {
  const showcaseRef = useRef(null);

  // --- newly added part ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);
  // ------------------------------

  const { scrollYProgress } = useScroll({
    target: showcaseRef,
    offset: ["start end", "end start"]
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const yFg = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);

  return (
    <div className="w-full overflow-hidden">
      {/* ==================== 1. HERO SECTION ==================== */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeOut" }}
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop"
            alt="Campus Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/80 mix-blend-multiply" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="relative z-10 text-center text-white px-4 max-w-5xl"
        >
          <p className="text-sm md:text-lg tracking-[0.3em] uppercase mb-6 text-accent font-bold">The Future of University Operations</p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">Campus Nexus Hub</h1>
          <p className="max-w-2xl mx-auto text-gray-200 mb-10 text-lg md:text-xl font-light leading-relaxed">
            Seamlessly book facilities, report maintenance issues, and manage campus resources all in one unified, intelligent platform.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">

            <Link
              to={isLoggedIn ? "/profile" : "/login"}
              className="inline-flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isLoggedIn ? "Go to Dashboard" : "Access Portal"} <FaArrowRight size={18} />
            </Link>

            <Link to="/contact" className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-all duration-300">
              Contact Us
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ==================== 2. HIGHLIGHTS SECTION ==================== */}
      <section className="py-24 relative z-10 bg-gray-50 -mt-10 rounded-t-[3rem]">
        <div className="container mx-auto px-6">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { icon: <FaLaptopCode />, title: "Resource Booking", desc: "Reserve lecture halls & labs instantly without conflicts." },
              { icon: <FaTools />, title: "Incident Tracking", desc: "Report damages with photo evidence and track resolution." },
              { icon: <FaBell />, title: "Smart Notifications", desc: "Get real-time updates on approvals and ticket statuses." },
              { icon: <FaStar />, title: "Role-Based Access", desc: "Secure interfaces for Students, Technicians, and Admins." },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 text-center group hover:border-secondary/30 hover:shadow-lg transition-all"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-secondary text-2xl mx-auto mb-6 group-hover:scale-110 group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ==================== INSPIRATIONAL QUOTE SECTION ==================== */}
      <section className="py-28 bg-white relative overflow-hidden">

        {/* Background Image */}
        <div className="absolute inset-0">
          <motion.img
            initial={{ scale: 1.1 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 8, ease: "easeOut" }}
            viewport={{ once: true }}
            src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2070&auto=format&fit=crop"
            alt="Innovation Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/85 mix-blend-multiply" />
        </div>

        {/* Quote Content */}
        <div className="container mx-auto px-6 relative z-10 text-center text-white max-w-4xl">

          {/* Animated Quote Text (Word-by-word reveal) */}
          <motion.blockquote
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.08
                }
              }
            }}
            className="text-3xl md:text-5xl font-light leading-relaxed italic mb-8 flex flex-wrap justify-center"
          >
            {"Education is not the learning of facts, but the training of the mind to think."
              .split(" ")
              .map((word, index) => (
                <motion.span
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 40 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  transition={{ duration: 0.5 }}
                  className="mr-2"
                >
                  {word}
                </motion.span>
              ))}
          </motion.blockquote>

          {/* Animated Author */}
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl font-semibold tracking-wide"
          >
            — Albert Einstein
          </motion.p>

        </div>
      </section>




      {/* ==================== 3. NEW: HOW IT WORKS (WORKFLOW) ==================== */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h4 className="text-secondary font-bold uppercase tracking-widest text-sm mb-4">Simple Workflow</h4>
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">How to Book a Resource</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Our system ensures fair usage and prevents scheduling conflicts through a streamlined 3-step approval process.
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-4 lg:gap-12 relative">
            {/* Connecting Line for Desktop */}
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-1 bg-gradient-to-r from-blue-100 via-secondary to-green-100 -z-10 transform -translate-y-1/2 rounded-full"></div>

            {[
              { step: "01", icon: <FaSearch />, title: "Login & Request", desc: "Find available rooms or equipment and submit a PENDING request.", color: "text-blue-500", bg: "bg-blue-50" },
              { step: "02", icon: <FaUserCheck />, title: "Admin Review", desc: "Administrators review the request based on purpose and availability.", color: "text-accent", bg: "bg-yellow-50" },
              { step: "03", icon: <FaCalendarCheck />, title: "Approval", desc: "Status changes to APPROVED and you receive an instant notification.", color: "text-green-500", bg: "bg-green-50" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.3 }}
                className="bg-blue-100 p-8 rounded-2xl shadow-lg border border-gray-100 text-center w-full md:w-1/3 relative"
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-primary text-white font-bold rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                  {item.step}
                </div>
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl mb-6 mt-4 ${item.bg} ${item.color}`}>
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 4. VISUAL SHOWCASE (Parallax) ==================== */}
      <section ref={showcaseRef} className="py-32 bg-primary relative overflow-hidden">
        <motion.div style={{ y: yBg }} className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop" alt="Background pattern" className="w-full h-[120%] object-cover -mt-[10%]" />
        </motion.div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 text-white">
              <motion.h2
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold mb-8"
              >
                Smart Infrastructure at Your Fingertips
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, delay: 0.2 }}
                className="text-gray-300 text-lg mb-10 leading-relaxed"
              >
                From logging a broken projector to reserving a high-performance computer lab, SmartCampus integrates all daily workflows. Built with a robust Spring Boot backend and an intuitive React frontend, we deliver reliability and speed.
              </motion.p>
              <Link to="/about" className="bg-white text-primary px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg">
                Learn About the Architecture
              </Link>
            </div>

            <motion.div style={{ y: yFg }} className="lg:w-1/2 grid grid-cols-2 gap-4">
              <div className="space-y-4 mt-12 lg:mt-24">
                <img src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=800&auto=format&fit=crop" alt="Meeting" className="rounded-2xl shadow-2xl" />
                <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop" alt="Code" className="rounded-2xl shadow-2xl" />
              </div>
              <div>
                <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop" alt="Server" className="rounded-2xl shadow-2xl h-full object-cover" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== 5. TESTIMONIALS ==================== */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">What Our Users Say</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Feedback from students, technicians, and administrators who use the system daily.
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                text: "Booking a study room used to involve long email chains. Now, I can see what's available and book it in two clicks. The interface is super clean.",
                author: "Sarah Jenkins",
                role: "Data Science Student",
                rating: 5
              },
              {
                text: "The ticketing system changed everything. I get photos of broken equipment before I even arrive at the lecture hall, saving me hours of diagnostic time.",
                author: "Mark Davis",
                role: "Senior IT Technician",
                rating: 5
              },
              {
                text: "Having a unified dashboard to approve bookings and monitor facility health gives us unparalleled oversight over campus operations.",
                author: "Dr. Alan Smith",
                role: "Facility Administrator",
                rating: 5
              }
            ].map((review, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 relative"
              >
                <FaQuoteRight className="absolute top-6 right-6 text-gray-100 h-12 w-12" />
                <div className="flex gap-1 mb-6 text-accent">
                  {[...Array(review.rating)].map((_, i) => <FaStar key={i} size={18} />)}
                </div>
                <p className="text-gray-600 italic mb-8 leading-relaxed z-10 relative">"{review.text}"</p>
                <div>
                  <h4 className="font-bold text-primary text-lg">{review.author}</h4>
                  <span className="text-secondary text-sm font-medium">{review.role}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>




      {/* ==================== 6. CTA SECTION ==================== */}
      <section className="py-20 bg-secondary text-white text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Ready to upgrade your campus experience?</h2>

          <Link
            to={isLoggedIn ? "/profile" : "/login"}
            className="bg-white text-secondary px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors shadow-lg inline-block"
          >
            {isLoggedIn ? "Go to Dashboard" : "Log In to Dashboard"}
          </Link>
          
        </div>
      </section>
    </div>
  );
};

export default Home;