import React, { createContext, useContext, useState } from 'react';
import type { Booking } from '../features/bookings/types';

/**
 * Booking Context
 * Manages global booking state and caching
 */

interface BookingContextType {
  selectedBooking: Booking | null;
  setSelectedBooking: (booking: Booking | null) => void;
  recentBookings: Booking[];
  addRecentBooking: (booking: Booking) => void;
  clearRecentBookings: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBookingContext = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookingContext must be used within BookingProvider');
  }
  return context;
};

interface BookingProviderProps {
  children: React.ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

  const addRecentBooking = (booking: Booking) => {
    setRecentBookings((prev) => [booking, ...prev.filter((b) => b.id !== booking.id)].slice(0, 5));
  };

  const clearRecentBookings = () => {
    setRecentBookings([]);
  };

  const value: BookingContextType = {
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
