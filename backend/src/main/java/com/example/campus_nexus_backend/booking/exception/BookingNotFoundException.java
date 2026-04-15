package com.example.campus_nexus_backend.booking.exception;

/**
 * Thrown when a booking with the requested code cannot be found in the system.
 *
 * <p>Mapped to HTTP {@code 404 Not Found} by
 * {@link BookingExceptionHandler#handleBookingNotFound}.</p>
 */
public class BookingNotFoundException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public BookingNotFoundException(String message) {
        super(message);
    }
}
