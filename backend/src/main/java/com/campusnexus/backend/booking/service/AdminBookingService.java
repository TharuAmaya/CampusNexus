package com.campusnexus.backend.booking.service;

import com.campusnexus.backend.booking.dto.*;

import java.util.List;

public interface AdminBookingService {
    List<BookingSummaryResponse> getAllBookings(AdminBookingFilterRequest filter);
    AdminBookingReviewResponse getBookingReviewDetails(String bookingCode);
    BookingResponse approveBooking(String bookingCode, ApproveBookingRequest request);
    BookingResponse rejectBooking(String bookingCode, RejectBookingRequest request);
    BookingCheckInResponse verifyQrToken(VerifyBookingQrRequest request);
}
