import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import DashboardLayout from './components/DashboardLayout';

// Pages — Admin
import { AdminBookingsDashboard } from './pages/admin/AdminBookingsDashboard';
import { BookingConflictReview } from './pages/admin/BookingConflictReview';
import { BookingScannerSimulator } from './pages/admin/BookingScannerSimulator';

// Pages — User
import { UserBookingsDashboard } from './pages/user/UserBookingsDashboard';
import { CreateBooking } from './pages/user/CreateBooking';
import { BookingDetails } from './pages/user/BookingDetails';

function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Navigate to="/bookings" replace />} />

          {/* User Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/bookings" element={<UserBookingsDashboard />} />
            <Route path="/bookings/new" element={<CreateBooking />} />
            <Route path="/bookings/:id" element={<BookingDetails />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/admin/bookings" element={<AdminBookingsDashboard />} />
            <Route path="/admin/bookings/:id" element={<BookingConflictReview />} />
            <Route path="/admin/scanner" element={<BookingScannerSimulator />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}

export default App;
