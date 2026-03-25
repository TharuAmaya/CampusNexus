import { motion } from 'framer-motion';
import { FaServer, FaReact, FaShieldAlt, FaMobileAlt, FaDatabase, FaGithub } from 'react-icons/fa';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20">
      {/* Hero Image Section (Achievements Style) */}
<div className="relative h-[40vh] min-h-[400px] flex items-center justify-center">
  <div className="absolute inset-0 z-0">
    <img 
      src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop" 
      alt="About SmartCampus" 
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
    <div className="text-accent font-bold uppercase tracking-widest text-sm mb-4">Our Story</div>
    <h1 className="text-5xl md:text-6xl font-bold mb-4">About SmartCampus Hub</h1>
    <p className="text-xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
      A production-inspired, enterprise-grade web system designed to modernize and streamline university facility management.
    </p>
  </motion.div>
</div>

      <div className="container mx-auto px-6 -mt-16 relative z-20">
        
        {/* Core Mission & Tech Stack Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-6xl mx-auto mb-16"
        >
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6 border-l-4 border-accent pl-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed mb-6 text-lg">
                Modern universities are complex ecosystems. Managing resources effectively—from high-tech data science labs to everyday meeting rooms—requires seamless coordination. 
              </p>
              <p className="text-gray-600 leading-relaxed text-lg">
                SmartCampus Hub eliminates paper trails and redundant email threads by providing a centralized platform. It empowers students to book resources easily, allows technicians to track maintenance tickets efficiently, and gives administrators complete oversight.
              </p>
            </div>
            
            {/* Tech Stack Visuals */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">Powered By Modern Tech Stack</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 hover:bg-blue-50 transition-colors p-6 rounded-2xl text-center border border-gray-100">
                   <FaReact className="text-5xl text-[#61DAFB] mx-auto mb-4" />
                   <h4 className="font-bold text-gray-800">React.js</h4>
                   <p className="text-sm text-gray-500 mt-2">Dynamic Client UI</p>
                </div>
                <div className="bg-gray-50 hover:bg-green-50 transition-colors p-6 rounded-2xl text-center border border-gray-100">
                   <FaServer className="text-5xl text-[#6DB33F] mx-auto mb-4" />
                   <h4 className="font-bold text-gray-800">Spring Boot</h4>
                   <p className="text-sm text-gray-500 mt-2">RESTful Backend API</p>
                </div>
                <div className="bg-gray-50 hover:bg-yellow-50 transition-colors p-6 rounded-2xl text-center border border-gray-100">
                   <FaDatabase className="text-5xl text-[#336791] mx-auto mb-4" />
                   <h4 className="font-bold text-gray-800">MySQL Database</h4>
                   <p className="text-sm text-gray-500 mt-2">Persistent Storage</p>
                </div>
                <div className="bg-gray-50 hover:bg-gray-100 transition-colors p-6 rounded-2xl text-center border border-gray-100">
                   <FaGithub className="text-5xl text-gray-800 mx-auto mb-4" />
                   <h4 className="font-bold text-gray-800">GitHub Actions</h4>
                   <p className="text-sm text-gray-500 mt-2">CI/CD Pipeline</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* System Modules Highlights */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Core System Modules</h2>
            <p className="text-gray-600">Built to handle real-world campus operations efficiently.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 text-secondary rounded-lg flex items-center justify-center text-xl mb-6">
                <FaMobileAlt />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Booking Workflow</h3>
              <p className="text-gray-600">Smart conflict checking prevents overlapping schedules. Fully integrated approval workflows (PENDING → APPROVED) for administrators.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-red-100 text-red-500 rounded-lg flex items-center justify-center text-xl mb-6">
                <FaShieldAlt />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Incident Ticketing</h3>
              <p className="text-gray-600">Users can create tickets with image attachments. Technicians can update statuses (OPEN → IN PROGRESS → RESOLVED) and add resolution notes.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-yellow-100 text-accent rounded-lg flex items-center justify-center text-xl mb-6">
                <FaShieldAlt />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Role-Based Security</h3>
              <p className="text-gray-600">Integrated with Google OAuth 2.0. Secure endpoints and protected routes ensuring Students, Technicians, and Admins only access what they need.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;