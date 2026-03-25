// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const;

// Check-in Status
export const CHECKIN_STATUS = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
} as const;

// Time constants
export const TIME_SLOTS = {
  START_HOUR: 7,
  END_HOUR: 22,
  SLOT_DURATION: 30, // minutes
} as const;
