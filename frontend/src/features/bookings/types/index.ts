// Base Booking Entity
export interface Booking {
  id: number;
  bookingCode: string;
  resourceId: string;
  userId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  purpose: string;
  expectedAttendees: number;
  adminDecisionReason?: string;
  qrToken?: string;
  checkedInAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingSummaryResponse {
  id: number;
  bookingCode: string;
  resourceId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  hasConflict: boolean;
}

// User Requests
export interface CreateBookingRequest {
  resourceId: string;
  userId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  expectedAttendees: number;
}

export interface UpdateBookingRequest {
  resourceId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  expectedAttendees: number;
}

// Admin Requests
export interface AdminBookingReviewResponse {
  bookingDetails: Booking;
  resourceSummary: string;
  approvedBookingsForDate: BookingSummaryResponse[];
  overlappingBookings: BookingSummaryResponse[];
  canApprove: boolean;
  reviewMessage: string;
}

export interface ApproveBookingRequest {
  adminDecisionReason?: string;
  approvedBy: string;
}

export interface RejectBookingRequest {
  adminDecisionReason: string;
  rejectedBy: string;
}

export interface VerifyBookingQrRequest {
  qrToken: string;
}

export interface BookingCheckInResponse {
  id: number;
  bookingId: number;
  qrTokenUsed: string;
  status: 'SUCCESS' | 'FAILED';
  failureReason?: string;
  checkInTime: string;
}
