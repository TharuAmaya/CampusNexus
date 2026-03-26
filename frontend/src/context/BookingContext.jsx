import React, { createContext, useContext, useState } from 'react';


/**
 * Booking Context
 * Manages global booking state and caching
 */

const BookingContext = createContext(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useBookingContext = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookingContext must be used within BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);

  const addRecentBooking = (booking) => {
    setRecentBookings((prev) => [booking, ...prev.filter((b) => b.id !== booking.id)].slice(0, 5));
  };

  const clearRecentBookings = () => {
    setRecentBookings([]);
  };

  const value = {
    selectedBooking,
    setSelectedBooking,
    recentBookings,
    addRecentBooking,
    clearRecentBookings,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
