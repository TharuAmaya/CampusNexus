import { motion } from 'framer-motion';
import { FaEye, FaRocket, FaHandshake, FaCalendarCheck, FaTicketAlt, FaUserShield } from 'react-icons/fa';
import { HiOutlineLightBulb } from 'react-icons/hi';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20">
      
      {/* --- HERO SECTION --- */}
      <div className="relative h-[45vh] min-h-[450px] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop" 
            alt="About CampusNexus" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/85 mix-blend-multiply" /> 
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center text-white px-6"
        >
          <div className="text-accent font-bold uppercase tracking-widest text-sm mb-4">Empowering Campus Life</div>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">About CampusNexus Hub</h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto font-light leading-relaxed">
            Redefining university operations through a centralized, intelligent management ecosystem.
          </p>
        </motion.div>
      </div>

      <div className="container mx-auto px-6 -mt-20 relative z-20">
        
        {/* --- VISION & MISSION SECTION --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-[40px] shadow-2xl p-8 md:p-16 max-w-6xl mx-auto mb-20"
        >
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            
            {/* Vision Column */}
            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                  <FaEye />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Our Vision</h2>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed italic">
                "To be the digital heartbeat of modern education, where technology and human collaboration coexist to create an optimized, frictionless campus environment."
              </p>
              <div className="mt-8 border-t border-gray-100 pt-6">
                <p className="text-gray-500">We aim to set the global standard for smart facility management in higher education.</p>
              </div>
            </div>

            {/* Mission Column */}
            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                  <FaRocket />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Our Mission</h2>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                "To empower university stakeholders with intuitive digital tools that eliminate administrative bottlenecks, optimize resource utilization, and foster transparency across all departments."
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-3 text-gray-600 font-medium">
                  <div className="w-2 h-2 bg-accent rounded-full" /> Streamlining resource access.
                </li>
                <li className="flex items-center gap-3 text-gray-600 font-medium">
                  <div className="w-2 h-2 bg-accent rounded-full" /> Enhancing maintenance speed.
                </li>
                <li className="flex items-center gap-3 text-gray-600 font-medium">
                  <div className="w-2 h-2 bg-accent rounded-full" /> Promoting data-driven decisions.
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* --- SYSTEM HIGHLIGHTS --- */}
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              <HiOutlineLightBulb className="text-lg"/> The CampusNexus Edge
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why SmartCampus Hub?</h2>
            <div className="w-20 h-1.5 bg-accent rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <div className="bg-white p-10 rounded-[30px] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-8">
                <FaCalendarCheck />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Centralized Booking</h3>
              <p className="text-gray-600 leading-relaxed">
                Eliminate booking conflicts with our intelligent scheduling engine. From labs to event halls, management is now at your fingertips.
              </p>
            </div>
            
            {/* Value 2 */}
            <div className="bg-white p-10 rounded-[30px] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center text-2xl mb-8">
                <FaTicketAlt />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Rapid Response</h3>
              <p className="text-gray-600 leading-relaxed">
                Our incident ticketing system ensures that maintenance issues are resolved in record time, keeping the campus running smoothly.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-white p-10 rounded-[30px] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-8">
                <FaUserShield />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Security First</h3>
              <p className="text-gray-600 leading-relaxed">
                Enterprise-grade security ensuring user privacy and data integrity through robust authentication and role-based access.
              </p>
            </div>
          </div>
        </div>

        {/* --- BOTTOM TEAM CTA --- */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-24 bg-gray-900 rounded-[40px] p-12 text-center text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full"></div>
          
          <h2 className="text-3xl font-bold mb-6 flex items-center justify-center gap-3">
             Collaborative Innovation <FaHandshake className="text-accent" />
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8 text-lg">
            SmartCampus Hub is more than just software—it's a commitment to improving the academic experience for students, staff, and administrators alike.
          </p>
          <div className="flex justify-center gap-12 text-sm uppercase tracking-widest font-bold text-gray-500">
            <span>Production Ready</span>
            <span>Scalable</span>
            <span>Secure</span>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default About;