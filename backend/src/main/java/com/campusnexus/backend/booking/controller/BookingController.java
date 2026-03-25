package com.campusnexus.backend.booking.controller;

import com.campusnexus.backend.booking.dto.*;
import com.campusnexus.backend.booking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.CacheControl;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody CreateBookingRequest request) {
        return new ResponseEntity<>(bookingService.createBooking(request), HttpStatus.CREATED);
    }

    @PutMapping("/{bookingId}")
    public ResponseEntity<BookingResponse> updateBooking(
            @PathVariable String bookingId,
            @Valid @RequestBody UpdateBookingRequest request) {
        return ResponseEntity.ok(bookingService.updateBooking(bookingId, request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingSummaryResponse>> getMyBookings(@RequestParam String userId) {
        // Without security context, we accept userId as a parameter for mock purposes
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(30, TimeUnit.SECONDS).cachePrivate())
                .body(bookingService.getUserBookings(userId));
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<BookingResponse> getBooking(@PathVariable String bookingId) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(60, TimeUnit.SECONDS).cachePrivate())
                .body(bookingService.getBookingByCode(bookingId));
    }

    @PatchMapping("/{bookingId}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable String bookingId,
            @RequestParam String cancelledBy) {
        return ResponseEntity.ok(bookingService.cancelBooking(bookingId, cancelledBy));
    }

    @GetMapping("/{bookingId}/qr")
    public ResponseEntity<BookingQrResponse> getBookingQrToken(@PathVariable String bookingId) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(60, TimeUnit.SECONDS).cachePrivate())
                .body(bookingService.getBookingQrToken(bookingId));
    }
}
