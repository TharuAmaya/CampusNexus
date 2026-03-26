package com.example.campus_nexus_backend.booking.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyBookingQrRequest {
    
    @NotBlank(message = "QR Token is required")
    private String qrToken;
}
