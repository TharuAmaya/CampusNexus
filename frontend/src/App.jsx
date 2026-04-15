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
import AdminTickets from './pages/admin/AdminTickets.jsx';
import AdminTicketDetails from './pages/admin/AdminTicketDetails.jsx';
import StudentHome from './pages/student/StudentHome.jsx';
import TechnicianHome from './pages/technician/TechnicianHome.jsx';
import AssignedTickets from './pages/technician/AssignedTickets.jsx';
import TechnicianTicketDetails from './pages/technician/TechnicianTicketDetails.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx'; // ආරක්‍ෂක component එක

///View grades page එක
import ViewGrades from './pages/student/ViewGrades.jsx';
//logged-profile page
import Profile from './pages/Profile.jsx';

//admin user management page
import ManageUsers from './pages/admin/ManageUsers';

//admin booking management pages
import AdminBookingDashboard from './pages/admin/booking/AdminBookingDashboard.jsx';
import AdminBookingReview from './pages/admin/booking/AdminBookingReview.jsx';
import AdminBookingScanner from './pages/admin/booking/AdminBookingScanner.jsx';

import Tickets from './pages/student/Tickets.jsx';
import AllTickets from './pages/student/AllTickets.jsx';
import StudentTicketDetails from './pages/student/StudentTicketDetails.jsx';
import MyBookings from './pages/student/booking/MyBookings.jsx';
import CreateBooking from './pages/student/booking/CreateBooking.jsx';
import BookingDetails from './pages/student/booking/BookingDetails.jsx';

//Resource management pages
import ResourceHome from './pages/admin/facilities/ResourceHome/ResourceHome.jsx';
import AddResource from './pages/admin/facilities/AddResource/AddResource.jsx';
import DisplayResource from './pages/admin/facilities/DisplayResource/DisplayResource.jsx';
import UpdateResource from './pages/admin/facilities/UpdateResource/UpdateResource.jsx';
import ResourceCatalogue from './pages/student/facilities/ResourceCatalogue.jsx';


// Notifications Pages
import AdminNotifications from './pages/admin/AdminNotifications.jsx';
import StudentNotifications from './pages/student/StudentNotifications.jsx';
import TechnicianNotifications from './pages/technician/TechnicianNotifications.jsx';

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

            <Route
              path="/student/all-tickets"
              element={
                <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                  <AllTickets />
                </ProtectedRoute>}
            />

            <Route
              path="/student/all-tickets/:ticketId"
              element={
                <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                  <StudentTicketDetails />
                </ProtectedRoute>}
            />

            <Route
              path="/student/booking"
              element={
                <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                  <MyBookings />
                </ProtectedRoute>}
            />

            <Route
              path="/student/booking/new"
              element={
                <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                  <CreateBooking />
                </ProtectedRoute>}
            />

            <Route
              path="/student/booking/:id"
              element={
                <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                  <BookingDetails />
                </ProtectedRoute>}
            />

            {/*/* Resource management routes (Student only) */}
            <Route
              path="/student/resources"
              element={
                <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                  <ResourceCatalogue />
                </ProtectedRoute>}
            />

                {/*/* Student Notifications */}
            <Route
              path="/student/notifications"
              element={
                <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                  <StudentNotifications />
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

            <Route
              path="/admin/tickets"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminTickets />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/booking"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminBookingDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/tickets/:ticketId"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminTicketDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/booking/review/:id"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminBookingReview />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/booking/scanner"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminBookingScanner />
                </ProtectedRoute>
              }
            />

              {/* Admin Notifications */}
              <Route
              path="/admin/notifications"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminNotifications />
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

            <Route
              path="/technician/tickets"
              element={
                <ProtectedRoute allowedRoles={['ROLE_TECHNICIAN']}>
                  <AssignedTickets />
                </ProtectedRoute>
              }
            />

            <Route
              path="/technician/tickets/:ticketId"
              element={
                <ProtectedRoute allowedRoles={['ROLE_TECHNICIAN']}>
                  <TechnicianTicketDetails />
                </ProtectedRoute>
              }
            />

              {/* Technician Notifications */}
            <Route
              path="/technician/notifications"
              element={
                <ProtectedRoute allowedRoles={['ROLE_TECHNICIAN']}>
                  <TechnicianNotifications />
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

            {/*/* Resource management routes (Admin only) */}
            <Route
              path="/resourcehome"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <ResourceHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/addresource"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AddResource />
                </ProtectedRoute>
              }
            />
            <Route
              path="/displayresource"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <DisplayResource />
                </ProtectedRoute>
              }
            />
            <Route
              path="/updateresource/:id"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <UpdateResource />
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

//sahiru
//guneds