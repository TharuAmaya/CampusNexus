package com.campusnexus.backend.booking.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApproveBookingRequest {
    
    private String adminDecisionReason;
    
    @NotBlank(message = "Approved by (Admin ID) is required")
    private String approvedBy;
}
