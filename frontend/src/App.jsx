import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// ... ඔයාගේ කලින් තියෙන imports (Navbar, Home etc.) ...
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import LoginSuccess from './pages/LoginSuccess.jsx';
import Services from './pages/Services.jsx';
import Achievements from './pages/Achievements.jsx';
import AboutUs from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Footer from './components/Footer.jsx';

// --- අලුත් IMPORTS ---
import AdminHome from './pages/admin/AdminHome.jsx'; // Folder structure එක බලන්න
import StudentHome from './pages/student/StudentHome.jsx';
import TechnicianHome from './pages/technician/TechnicianHome.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx'; // ආරක්‍ෂක component එක

///View grades page එක
import ViewGrades from './pages/student/ViewGrades.jsx';
//logged-profile page
import Profile from './pages/Profile.jsx';

//admin user management page
import ManageUsers from './pages/admin/ManageUsers';

import Tickets from './pages/student/Tickets.jsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col pt-16 h-full w-full">
          <Routes>
            {/* -- සාමාන්‍ය (Public) Routes -- */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login/success" element={<LoginSuccess />} />
            <Route path="/services" element={<Services />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />



            {/* -- Unauthorized (පින් පඩිය) Route -- */}
            <Route path="/unauthorized" element={<div className="container mx-auto mt-40 p-10 text-center"><h1 className="text-4xl font-bold text-red-600">Access Blocked! Unauthorized Area ⚠️</h1><p className="mt-5 text-xl">You don't have permission to view this page.</p></div>} />

            {/* == ආරක්ෂිත (Protected) Routes - ROLE BASED == */}

            {/* -- STUDENT DASHBOARD -- */}
            <Route
              path="/student-dashboard"
              element={
                <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                  <StudentHome /> {/* අවසර තියෙන්නේ StudentHome Component එකට */}
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/grades"
              element={
                <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                  <ViewGrades />
                </ProtectedRoute>}
            />


            <Route
              path="/student/publish-ticket"
              element={
                <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                  <Tickets />
                </ProtectedRoute>}
            />




            


            {/* -- ADMIN DASHBOARD -- */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminHome />
                </ProtectedRoute>
              }
            />


            {/* ADMIN ROUTES */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />



            {/* -- TECHNICIAN DASHBOARD -- */}
            <Route
              path="/technician-dashboard"
              element={
                <ProtectedRoute allowedRoles={['ROLE_TECHNICIAN']}>
                  <TechnicianHome />
                </ProtectedRoute>
              }
            />



            {/* -- COMMON PROTECTED ROUTES (හැමෝටම යන්න පුළුවන්) -- */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_STUDENT', 'ROLE_TECHNICIAN']}>
                  <Profile />
                </ProtectedRoute>
              }
            />


            {/* Catch-all route (Page Not Found) */}
            <Route path="*" element={<div className="container mx-auto mt-40 text-center"><h1 className="text-4xl">404 - Page Not Found 🧐</h1></div>} />
          </Routes>
        </main>

        {/* Footer Area */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;