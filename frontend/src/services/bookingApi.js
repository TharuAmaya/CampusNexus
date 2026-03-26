import axios from 'axios';

// Create base Axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ========================================================
   USER ENDPOINTS (/api/bookings)
   ======================================================== */

export const createBooking = async (data) => {
  const response = await api.post('/bookings', data);
  return response.data;
};

export const updateBooking = async (bookingId, data) => {
  const response = await api.put(`/bookings/${bookingId}`, data);
  return response.data;
};

export const getMyBookings = async (userId) => {
  const response = await api.get('/bookings/my', { params: { userId } });
  return response.data;
};

export const getBooking = async (bookingId) => {
  const response = await api.get(`/bookings/${bookingId}`);
  return response.data;
};

export const cancelBooking = async (bookingId, cancelledBy) => {
  const response = await api.patch(`/bookings/${bookingId}/cancel`, null, { params: { cancelledBy } });
  return response.data;
};

export const getBookingQrToken = async (bookingId) => {
  const response = await api.get(`/bookings/${bookingId}/qr`);
  return response.data;
};

/* ========================================================
   ADMIN ENDPOINTS (/api/admin/bookings)
   ======================================================== */

export const getAllBookings = async (filters) => {
  const response = await api.get('/admin/bookings', { params: filters });
  return response.data;
};

export const getBookingReviewDetails = async (bookingId) => {
  const response = await api.get(`/admin/bookings/${bookingId}/review`);
  return response.data;
};

export const approveBooking = async (bookingId, data) => {
  const response = await api.patch(`/admin/bookings/${bookingId}/approve`, data);
  return response.data;
};

export const rejectBooking = async (bookingId, data) => {
  const response = await api.patch(`/admin/bookings/${bookingId}/reject`, data);
  return response.data;
};

export const verifyQrToken = async (data) => {
  const response = await api.post('/admin/bookings/verify-qr', data);
  return response.data;
};
