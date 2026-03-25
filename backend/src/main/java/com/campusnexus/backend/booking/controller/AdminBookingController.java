package com.campusnexus.backend.booking.controller;

import com.campusnexus.backend.booking.dto.*;
import com.campusnexus.backend.booking.service.AdminBookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.CacheControl;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
public class AdminBookingController {

    private final AdminBookingService adminBookingService;

    @GetMapping
    public ResponseEntity<List<BookingSummaryResponse>> getAllBookings(@ModelAttribute AdminBookingFilterRequest filter) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(30, TimeUnit.SECONDS).cachePrivate())
                .body(adminBookingService.getAllBookings(filter));
    }

    @GetMapping("/{bookingId}/review")
    public ResponseEntity<AdminBookingReviewResponse> getBookingReviewDetails(@PathVariable String bookingId) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(30, TimeUnit.SECONDS).cachePrivate())
                .body(adminBookingService.getBookingReviewDetails(bookingId));
    }

    @PatchMapping("/{bookingId}/approve")
    public ResponseEntity<BookingResponse> approveBooking(
            @PathVariable String bookingId,
            @Valid @RequestBody ApproveBookingRequest request) {
        return ResponseEntity.ok(adminBookingService.approveBooking(bookingId, request));
    }

    @PatchMapping("/{bookingId}/reject")
    public ResponseEntity<BookingResponse> rejectBooking(
            @PathVariable String bookingId,
            @Valid @RequestBody RejectBookingRequest request) {
        return ResponseEntity.ok(adminBookingService.rejectBooking(bookingId, request));
    }

    @PostMapping("/verify-qr")
    public ResponseEntity<BookingCheckInResponse> verifyQrToken(@Valid @RequestBody VerifyBookingQrRequest request) {
        return ResponseEntity.ok(adminBookingService.verifyQrToken(request));
    }
}
