package com.example.campus_nexus_backend.maintenance_and_ticketing.dto.comment;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TicketCommentResponseDTO {
    private Long commentId;
    private String commentText;
    private String authorName;
    private String authorEmail;
    private String authorRole; // So the frontend knows if it's a Tech or Student comment
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}