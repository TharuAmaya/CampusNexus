import axios from 'axios';
import type { 
  Booking, 
  BookingSummaryResponse,
  CreateBookingRequest, 
  UpdateBookingRequest,
  AdminBookingReviewResponse,
  ApproveBookingRequest,
  RejectBookingRequest,
  VerifyBookingQrRequest,
  BookingCheckInResponse
} from '../../features/bookings/types';

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

export const createBooking = async (data: CreateBookingRequest): Promise<Booking> => {
  const response = await api.post('/bookings', data);
  return response.data;
};

export const updateBooking = async (bookingId: string, data: UpdateBookingRequest): Promise<Booking> => {
  const response = await api.put(`/bookings/${bookingId}`, data);
  return response.data;
};

export const getMyBookings = async (userId: string): Promise<BookingSummaryResponse[]> => {
  const response = await api.get('/bookings/my', { params: { userId } });
  return response.data;
};

export const getBooking = async (bookingId: string): Promise<Booking> => {
  const response = await api.get(`/bookings/${bookingId}`);
  return response.data;
};

export const cancelBooking = async (bookingId: string, cancelledBy: string): Promise<Booking> => {
  const response = await api.patch(`/bookings/${bookingId}/cancel`, null, { params: { cancelledBy } });
  return response.data;
};

export const getBookingQrToken = async (bookingId: string): Promise<{ qrToken: string }> => {
  const response = await api.get(`/bookings/${bookingId}/qr`);
  return response.data;
};

/* ========================================================
   ADMIN ENDPOINTS (/api/admin/bookings)
   ======================================================== */

export const getAllBookings = async (filters: Record<string, unknown>): Promise<BookingSummaryResponse[]> => {
  const response = await api.get('/admin/bookings', { params: filters });
  return response.data;
};

export const getBookingReviewDetails = async (bookingId: string): Promise<AdminBookingReviewResponse> => {
  const response = await api.get(`/admin/bookings/${bookingId}/review`);
  return response.data;
};

export const approveBooking = async (bookingId: string, data: ApproveBookingRequest): Promise<Booking> => {
  const response = await api.patch(`/admin/bookings/${bookingId}/approve`, data);
  return response.data;
};

export const rejectBooking = async (bookingId: string, data: RejectBookingRequest): Promise<Booking> => {
  const response = await api.patch(`/admin/bookings/${bookingId}/reject`, data);
  return response.data;
};

export const verifyQrToken = async (data: VerifyBookingQrRequest): Promise<BookingCheckInResponse> => {
  const response = await api.post('/admin/bookings/verify-qr', data);
  return response.data;
};
