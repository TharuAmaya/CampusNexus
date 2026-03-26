package com.example.campus_nexus_backend.booking.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RejectBookingRequest {
    
    @NotBlank(message = "Rejection reason is required")
    private String adminDecisionReason;
    
    @NotBlank(message = "Rejected by (Admin ID) is required")
    private String rejectedBy;
}
