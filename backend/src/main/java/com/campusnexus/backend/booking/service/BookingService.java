package com.campusnexus.backend.booking.service;

import com.campusnexus.backend.booking.dto.*;

import java.util.List;

public interface BookingService {
    BookingResponse createBooking(CreateBookingRequest request);
    BookingResponse updateBooking(String bookingCode, UpdateBookingRequest request);
    BookingResponse cancelBooking(String bookingCode, String cancelledBy);
    BookingResponse getBookingByCode(String bookingCode);
    List<BookingSummaryResponse> getUserBookings(String userId);
    BookingQrResponse getBookingQrToken(String bookingCode);
}
