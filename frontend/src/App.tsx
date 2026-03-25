import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

// Modular Feature Imports
import { UserBookingsDashboard } from './features/bookings/pages/UserBookingsDashboard';
import { CreateBooking } from './features/bookings/pages/CreateBooking';
import { BookingDetails } from './features/bookings/pages/BookingDetails';
import { AdminBookingsDashboard } from './features/bookings/pages/AdminBookingsDashboard';
import { BookingConflictReview } from './features/bookings/pages/BookingConflictReview';
import { BookingScannerSimulator } from './features/bookings/pages/BookingScannerSimulator';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to user dashboard by default */}
        <Route path="/" element={<Navigate to="/bookings" replace />} />

        {/* User Routes (Student/Staff) */}
        <Route element={<UserLayout />}>
          <Route path="/bookings" element={<UserBookingsDashboard />} />
          <Route path="/bookings/new" element={<CreateBooking />} />
          <Route path="/bookings/:id" element={<BookingDetails />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/bookings" element={<AdminBookingsDashboard />} />
          <Route path="/admin/bookings/:id" element={<BookingConflictReview />} />
          <Route path="/admin/scanner" element={<BookingScannerSimulator />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
