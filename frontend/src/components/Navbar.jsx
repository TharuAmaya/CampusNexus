import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGraduationCap, FaBars, FaTimes } from 'react-icons/fa';
import { jwtDecode } from "jwt-decode"; // Token එක කියවන්න

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardRoute, setDashboardRoute] = useState('/');
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Component එක Load වෙද්දී Token එක තියෙනවද බලනවා
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      try {
        // Token එක දිගහැරලා Role එක අරගෙන Dashboard පාර හදනවා
        const decoded = jwtDecode(token);
        if (decoded.role === 'ROLE_ADMIN') {
          setDashboardRoute('/admin-dashboard');
        } else if (decoded.role === 'ROLE_TECHNICIAN') {
          setDashboardRoute('/technician-dashboard');
        } else {
          setDashboardRoute('/student-dashboard');
        }
      } catch (error) {
        console.error("Invalid token", error);
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      }
    }
  }, []);

  // Logout Function එක
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/login');
    window.location.reload(); // මුළු App එකම අලුත් වෙන්න (State clear වෙන්න)
  };

  // Active Link Style Logic (Desktop)
  const getDesktopLinkStyle = ({ isActive }) => {
    return `relative font-medium transition-colors duration-300 py-2 ${
      isActive ? 'text-primary' : 'text-gray-500 hover:text-primary'
    }`;
  };

  // Active Link Style Logic (Mobile)
  const getMobileLinkStyle = ({ isActive }) => {
    return `block px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
      isActive 
        ? 'bg-blue-50 text-primary border-l-4 border-primary' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-primary border-l-4 border-transparent'
    }`;
  };

  return (
    <motion.nav 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white/95 backdrop-blur-sm shadow-md fixed w-full top-0 z-50 border-b border-gray-100"
    >
      <div className="container mx-auto flex justify-between items-center px-4 md:px-8 py-4">
        
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 text-primary text-2xl font-bold z-50 group">
          <FaGraduationCap className="text-accent text-3xl group-hover:rotate-12 transition-transform duration-300" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">CampusNexus</span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden lg:flex gap-8 items-center">
          
          {[
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: "Achievements", path: "/achievements" },
            { name: "About Us", path: "/about" },
            { name: "Contact", path: "/contact" }
          ].map((item) => (
            <NavLink 
              key={item.name} 
              to={item.path} 
              className={getDesktopLinkStyle}
            >
              {({ isActive }) => (
                <>
                  {item.name}
                  {isActive && (
                    <motion.div 
                      layoutId="underline" 
                      className="absolute left-0 bottom-0 w-full h-[3px] bg-accent rounded-full" 
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}

          {/* ---- Desktop Login/Logout Section ---- */}
          <div className="ml-2 flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {/* Log වෙලා නම් Dashboard ලින්ක් එක පෙන්නනවා */}
                <Link to={dashboardRoute} className="text-gray-600 font-bold hover:text-primary transition-colors px-3">
                  Dashboard
                </Link>
                {/* Logout Button */}
                <button 
                  onClick={handleLogout}
                  className="bg-red-50 text-red-600 border border-red-200 px-6 py-2 rounded-full hover:bg-red-100 transition-all shadow-sm font-bold transform hover:-translate-y-0.5"
                >
                  Logout
                </button>
              </>
            ) : (
              /* Log වෙලා නැත්නම් Login Button එක පෙන්නනවා */
              <Link to="/login">
                <button className="bg-primary text-white px-8 py-2.5 rounded-full hover:bg-blue-800 transition-all shadow-md hover:shadow-lg font-bold transform hover:-translate-y-0.5">
                  Login
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="lg:hidden flex items-center z-50">
          <button 
            onClick={toggleMenu} 
            className="text-primary text-2xl focus:outline-none p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden bg-white border-t border-gray-100 overflow-hidden shadow-2xl absolute w-full left-0 top-full"
          >
            <div className="flex flex-col px-4 py-6 space-y-2">
              {[
                { name: "Home", path: "/" },
                { name: "Services", path: "/services" },
                { name: "Achievements", path: "/achievements" },
                { name: "About Us", path: "/about" },
                { name: "Contact", path: "/contact" }
              ].map((item) => (
                <NavLink 
                  key={item.name} 
                  to={item.path} 
                  onClick={toggleMenu}
                  className={getMobileLinkStyle}
                >
                  {item.name}
                </NavLink>
              ))}
              
              {/* ---- Mobile Login/Logout Section ---- */}
              <div className="pt-6 pb-2 px-4 mt-4 border-t border-gray-100">
                {isLoggedIn ? (
                  <div className="flex flex-col gap-3">
                    <Link to={dashboardRoute} onClick={toggleMenu}>
                      <button className="w-full bg-blue-50 text-primary border border-blue-200 px-5 py-3.5 rounded-xl hover:bg-blue-100 transition shadow-sm font-bold text-lg">
                        Dashboard
                      </button>
                    </Link>
                    <button 
                      onClick={() => { handleLogout(); toggleMenu(); }} 
                      className="w-full bg-red-50 text-red-600 border border-red-200 px-5 py-3.5 rounded-xl hover:bg-red-100 transition shadow-sm font-bold text-lg"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link to="/login" onClick={toggleMenu}>
                    <button className="w-full bg-primary text-white px-5 py-3.5 rounded-xl hover:bg-blue-800 transition shadow-md font-bold text-lg flex justify-center items-center gap-2">
                      Access Portal
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;