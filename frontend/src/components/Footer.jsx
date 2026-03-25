import { Link } from 'react-router-dom';
import { FaGraduationCap, FaFacebook, FaTwitter, FaLinkedin, FaGithub, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-[#0B1120] text-gray-300 pt-16 pb-8 border-t border-gray-800">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-white text-2xl font-bold mb-4">
              <FaGraduationCap className="text-accent text-3xl" />
              <span>CampusNexus</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Modernizing university operations with a unified platform for facility bookings, incident reporting, and campus management.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-secondary hover:text-white transition-colors"><FaFacebook /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-secondary hover:text-white transition-colors"><FaTwitter /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-secondary hover:text-white transition-colors"><FaLinkedin /></a>
              <a href="https://github.com/lakshan698" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-600 hover:text-white transition-colors"><FaGithub /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="hover:text-accent transition-colors flex items-center gap-2"><span>›</span> Home</Link></li>
              <li><Link to="/" className="hover:text-accent transition-colors flex items-center gap-2"><span>›</span> Resource Catalogue</Link></li>
              <li><Link to="/about" className="hover:text-accent transition-colors flex items-center gap-2"><span>›</span> About System</Link></li>
              <li><Link to="/contact" className="hover:text-accent transition-colors flex items-center gap-2"><span>›</span> IT Support</Link></li>
            </ul>
          </div>

          {/* System Modules */}
          <div>
            <h3 className="text-white text-lg font-bold mb-6">System Modules</h3>
            <ul className="space-y-3">
              <li className="text-gray-400 hover:text-white transition-colors cursor-pointer">Booking Management</li>
              <li className="text-gray-400 hover:text-white transition-colors cursor-pointer">Incident Ticketing</li>
              <li className="text-gray-400 hover:text-white transition-colors cursor-pointer">Role-Based Dashboard</li>
              <li className="text-gray-400 hover:text-white transition-colors cursor-pointer">Smart Notifications</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white text-lg font-bold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-accent mt-1 flex-shrink-0" />
                <span className="text-sm">Faculty of Computing, SLIIT Campus, Malabe, Sri Lanka</span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhone className="text-accent flex-shrink-0" />
                <span className="text-sm">+94 11 234 5678</span>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-accent flex-shrink-0" />
                <span className="text-sm">support@smartcampus.lk</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} SmartCampus Hub. Group Coursework - IT3030. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;