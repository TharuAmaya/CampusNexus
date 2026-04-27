package com.example.campus_nexus_backend.announcements;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AnnouncementErrorResponse {
    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
}