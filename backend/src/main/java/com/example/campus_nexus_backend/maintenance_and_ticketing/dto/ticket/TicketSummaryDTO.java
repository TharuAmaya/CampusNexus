package com.example.campus_nexus_backend.maintenance_and_ticketing.dto.ticket;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TicketSummaryDTO {
    private Long ticketId;
    private String category;
    private String priority;
    private String status;
    private String createdByEmail;
    private String assignedToEmail;
    private LocalDateTime createdAt;
}