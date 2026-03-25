package com.campusnexus.backend.booking.dto;

import com.campusnexus.backend.booking.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private String bookingCode;
    private String resourceId;
    private String userId;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private Integer expectedAttendees;
    private BookingStatus status;
    private String adminDecisionReason;
    private String qrToken;
    private LocalDateTime checkedInAt;
    private LocalDateTime approvedAt;
    private String approvedBy;
    private LocalDateTime rejectedAt;
    private String rejectedBy;
    private LocalDateTime cancelledAt;
    private String cancelledBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
