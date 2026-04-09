package com.example.campus_nexus_backend.booking.controller;

import com.example.campus_nexus_backend.booking.dto.*;
import com.example.campus_nexus_backend.booking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.CacheControl;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Controller for managing user booking operations.
 * Exposes RESTful endpoints for creating, reading, updating, canceling, and deleting bookings.
 */
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    /**
     * Creates a new booking.
     * 
     * @param request The booking creation payload
     * @return The created booking details along with a 201 Created status and Location header
     */
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody CreateBookingRequest request) {
        BookingResponse response = bookingService.createBooking(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.getBookingCode())
                .toUri();
        return ResponseEntity.created(location).body(response);
    }

    /**
     * Updates an existing booking.
     * 
     * @param bookingId The unique code of the booking
     * @param request The updated booking details
     * @return The updated booking response
     */
    @PutMapping("/{bookingId}")
    public ResponseEntity<BookingResponse> updateBooking(
            @PathVariable("bookingId") String bookingId,
            @Valid @RequestBody UpdateBookingRequest request) {
        return ResponseEntity.ok(bookingService.updateBooking(bookingId, request));
    }

    /**
     * Retrieves all bookings for a specific user.
     * 
     * @param userId The ID of the user
     * @return A list of booking summaries associated with the user
     */
    @GetMapping("/my")
    public ResponseEntity<List<BookingSummaryResponse>> getMyBookings(@RequestParam("userId") String userId) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(30, TimeUnit.SECONDS).cachePrivate())
                .body(bookingService.getUserBookings(userId));
    }

    /**
     * Retrieves detailed information of a specific booking.
     * 
     * @param bookingId The unique code of the booking
     * @return The booking details
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<BookingResponse> getBooking(@PathVariable("bookingId") String bookingId) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(60, TimeUnit.SECONDS).cachePrivate())
                .body(bookingService.getBookingByCode(bookingId));
    }

    /**
     * Cancels a specific booking.
     * 
     * @param bookingId The unique code of the booking
     * @param cancelledBy The ID of the user cancelling the booking
     * @return The updated booking response
     */
    @PatchMapping("/{bookingId}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable("bookingId") String bookingId,
            @RequestParam("cancelledBy") String cancelledBy) {
        return ResponseEntity.ok(bookingService.cancelBooking(bookingId, cancelledBy));
    }

    /**
     * Retrieves the QR code token for checking into an approved booking.
     * 
     * @param bookingId The unique code of the booking
     * @return The QR token response
     */
    @GetMapping("/{bookingId}/qr")
    public ResponseEntity<BookingQrResponse> getBookingQrToken(@PathVariable("bookingId") String bookingId) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(60, TimeUnit.SECONDS).cachePrivate())
                .body(bookingService.getBookingQrToken(bookingId));
    }
}
