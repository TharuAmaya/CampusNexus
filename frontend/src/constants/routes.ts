// Route constants
export const ROUTES = {
  HOME: '/',
  BOOKINGS: '/bookings',
  CREATE_BOOKING: '/bookings/new',
  BOOKING_DETAILS: '/bookings/:id',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_BOOKING_REVIEW: '/admin/bookings/:id',
  ADMIN_SCANNER: '/admin/scanner',
} as const;

// Query keys for React Query
export const QUERY_KEYS = {
  BOOKINGS: 'bookings',
  MY_BOOKINGS: 'myBookings',
  BOOKING_DETAILS: 'bookingDetails',
  ADMIN_BOOKINGS: 'adminBookings',
  BOOKING_REVIEW: 'bookingReview',
} as const;
