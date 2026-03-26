package com.example.campus_nexus_backend.booking.dto;

import com.example.campus_nexus_backend.booking.enums.CheckInStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingCheckInResponse {
    private Long id;
    private Long bookingId;
    private String qrTokenUsed;
    private CheckInStatus status;
    private String failureReason;
    private LocalDateTime checkInTime;
}
