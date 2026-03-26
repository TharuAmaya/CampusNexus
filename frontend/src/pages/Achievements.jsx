import { motion } from 'framer-motion';
import { FaTrophy, FaUsers, FaCheckCircle, FaAward, FaClock } from 'react-icons/fa';

const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const Achievements = () => {
    return (
        <div className="min-h-screen bg-white pt-10 pb-20 overflow-hidden">

            {/* Hero Image Section Achivements*/}
            <div className="relative h-[40vh] min-h-[400px] flex items-center justify-center">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop"
                        alt="Achievement Celebration"
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
                    <FaTrophy className="text-5xl text-accent mx-auto mb-6" />
                    <h1 className="text-5xl md:text-6xl font-bold mb-4">Our Achievements</h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Transforming campus operations through digital innovation.
                    </p>
                </motion.div>
            </div>

            {/* Statistics Section */}
            <div className="container mx-auto px-6 -mt-16 relative z-20 mb-24">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { number: "10K+", label: "Successful Bookings", icon: <FaCheckCircle /> },
                        { number: "98%", label: "Faster Resolutions", icon: <FaClock /> },
                        { number: "5,000+", label: "Active Students", icon: <FaUsers /> },
                        { number: "99.9%", label: "System Uptime", icon: <FaAward /> }
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center"
                        >
                            <div className="text-3xl text-secondary flex justify-center mb-4">{stat.icon}</div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-2">{stat.number}</h2>
                            <p className="text-gray-500 font-medium uppercase tracking-wider text-sm">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Milestones / Awards Section */}
            <div className="container mx-auto px-6 max-w-5xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-primary mb-4">Milestones & Recognition</h2>
                    <p className="text-gray-600">How SmartCampus Hub is setting new standards in university IT infrastructure.</p>
                </div>

                <div className="space-y-8">
                    {[
                        {
                            year: "2026", title: "Best IT Innovation Project",
                            desc: "Awarded top marks in the IT3030 Programming Applications and Frameworks module for outstanding implementation of Spring Boot and React.",
                            img: "https://images.unsplash.com/photo-1561489413-985b06da5bee?q=80&w=800&auto=format&fit=crop"
                        },
                        {
                            year: "2025", title: "Zero Paper Workflow Achieved",
                            desc: "Successfully eliminated 100% of paper-based facility booking forms and manual maintenance request logs across the faculty.",
                            img: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800&auto=format&fit=crop"
                        },
                        {
                            year: "2025", title: "Cloud Integration Success",
                            desc: "Seamlessly migrated the database to cloud infrastructure, enabling real-time collaboration among all administration staff.",
                            img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop"
                        }
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            variants={fadeInUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="flex flex-col md:flex-row gap-8 bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
                        >
                            <div className="md:w-1/3">
                                <img src={item.img} alt={item.title} className="w-full h-full object-cover min-h-[200px]" />
                            </div>
                            <div className="md:w-2/3 p-8 flex flex-col justify-center">
                                <div className="text-accent font-bold text-xl mb-2">{item.year}</div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-4">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default Achievements;