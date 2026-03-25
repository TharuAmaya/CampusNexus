package com.campusnexus.backend.booking.dto;

import com.campusnexus.backend.booking.enums.BookingStatus;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AdminBookingFilterRequest {
    private BookingStatus status;
    private LocalDate bookingDate;
    private String resourceId;
    private String userId;
    private Boolean checkConflict;
}
