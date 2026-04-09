package com.example.campus_nexus_backend.booking.controller;

import com.example.campus_nexus_backend.booking.dto.*;
import com.example.campus_nexus_backend.booking.service.AdminBookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.CacheControl;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * REST Controller for managing administrator-level booking operations.
 * Provides endpoints for reviewing, approving, rejecting, and verifying bookings.
 */
@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
public class AdminBookingController {

    private final AdminBookingService adminBookingService;

    /**
     * Retrieves all bookings with optional filtering.
     * 
     * @param filter Criteria to filter bookings
     * @return A list of all matching bookings
     */
    @GetMapping
    public ResponseEntity<List<BookingSummaryResponse>> getAllBookings(@ModelAttribute AdminBookingFilterRequest filter) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(30, TimeUnit.SECONDS).cachePrivate())
                .body(adminBookingService.getAllBookings(filter));
    }

    /**
     * Retrieves detailed information of a booking for administrative review.
     * 
     * @param bookingId The unique code of the booking to review
     * @return Detailed review information for the booking
     */
    @GetMapping("/{bookingId}/review")
    public ResponseEntity<AdminBookingReviewResponse> getBookingReviewDetails(@PathVariable("bookingId") String bookingId) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(30, TimeUnit.SECONDS).cachePrivate())
                .body(adminBookingService.getBookingReviewDetails(bookingId));
    }

    /**
     * Approves a pending booking.
     * 
     * @param bookingId The unique code of the booking
     * @param request Approval details (e.g., admin remarks)
     * @return The updated booking response
     */
    @PatchMapping("/{bookingId}/approve")
    public ResponseEntity<BookingResponse> approveBooking(
            @PathVariable("bookingId") String bookingId,
            @Valid @RequestBody ApproveBookingRequest request) {
        return ResponseEntity.ok(adminBookingService.approveBooking(bookingId, request));
    }

    /**
     * Rejects a pending booking.
     * 
     * @param bookingId The unique code of the booking
     * @param request Rejection details (e.g., reason for rejection)
     * @return The updated booking response
     */
    @PatchMapping("/{bookingId}/reject")
    public ResponseEntity<BookingResponse> rejectBooking(
            @PathVariable("bookingId") String bookingId,
            @Valid @RequestBody RejectBookingRequest request) {
        return ResponseEntity.ok(adminBookingService.rejectBooking(bookingId, request));
    }

    /**
     * Verifies a QR token for a booking check-in.
     * 
     * @param request Payload containing the scanned QR token
     * @return Check-in outcome and details
     */
    @PostMapping("/verify-qr")
    public ResponseEntity<BookingCheckInResponse> verifyQrToken(@Valid @RequestBody VerifyBookingQrRequest request) {
        return ResponseEntity.ok(adminBookingService.verifyQrToken(request));
    }
}
