import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaMapMarkerAlt, FaUsers, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

// PDF එකේ Module A වලට අනුව හදපු Dummy Data
const facilitiesData = [
  { id: 1, name: "Main Auditorium", type: "Lecture Hall", capacity: 500, location: "Block A, Ground Floor", status: "ACTIVE", img: "https://images.unsplash.com/photo-1594122230689-45899d9e6f69?q=80&w=800&auto=format&fit=crop" },
  { id: 2, name: "Computing Lab 01", type: "Lab", capacity: 60, location: "Block B, 2nd Floor", status: "ACTIVE", img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop" },
  { id: 3, name: "Engineering Workshop", type: "Lab", capacity: 40, location: "Block C, 1st Floor", status: "OUT_OF_SERVICE", img: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=800&auto=format&fit=crop" },
  { id: 4, name: "Board Room A", type: "Meeting Room", capacity: 15, location: "Admin Block, 3rd Floor", status: "ACTIVE", img: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=800&auto=format&fit=crop" },
  { id: 5, name: "4K Sony Projector", type: "Equipment", capacity: "N/A", location: "IT Store Room", status: "ACTIVE", img: "https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?q=80&w=800&auto=format&fit=crop" },
  { id: 6, name: "Data Science Lab", type: "Lab", capacity: 80, location: "Block B, 4th Floor", status: "ACTIVE", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop" }
];

const Facilities = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");

  // Search සහ Filter කරන Logic එක
  const filteredFacilities = facilitiesData.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "All" || facility.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="container mx-auto max-w-7xl">
        
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Facilities & Assets Catalogue</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Browse and search for bookable resources including lecture halls, labs, meeting rooms, and equipment.
          </p>
        </motion.div>

        {/* Search & Filter Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-10 flex flex-col md:flex-row gap-4 justify-between items-center"
        >
          <div className="relative w-full md:w-1/2">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name..." 
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-auto flex items-center gap-3">
            <span className="text-gray-500 font-medium">Filter:</span>
            <select 
              className="bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 rounded-xl focus:outline-none focus:border-secondary cursor-pointer"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">All Resources</option>
              <option value="Lecture Hall">Lecture Halls</option>
              <option value="Lab">Labs</option>
              <option value="Meeting Room">Meeting Rooms</option>
              <option value="Equipment">Equipment</option>
            </select>
          </div>
        </motion.div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFacilities.map((facility, index) => (
            <motion.div 
              key={facility.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group"
            >
              <div className="h-48 overflow-hidden relative">
                <img src={facility.img} alt={facility.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 right-4">
                  {facility.status === "ACTIVE" ? (
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                      <FaCheckCircle /> ACTIVE
                    </span>
                  ) : (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                      <FaExclamationCircle /> OUT OF SERVICE
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                <div className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">{facility.type}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{facility.name}</h3>
                
                <div className="space-y-2 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-accent" />
                    <span>{facility.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaUsers className="text-accent" />
                    <span>Capacity: {facility.capacity}</span>
                  </div>
                </div>

                <button className={`w-full py-3 rounded-xl font-bold transition-colors ${facility.status === "ACTIVE" ? "bg-primary text-white hover:bg-blue-800" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}>
                  {facility.status === "ACTIVE" ? "Request Booking" : "Currently Unavailable"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredFacilities.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <h3 className="text-2xl font-bold mb-2">No resources found</h3>
            <p>Try adjusting your search or filter settings.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Facilities;