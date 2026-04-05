package com.example.campus_nexus_backend.maintenance_and_ticketing.dto.ticket;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TicketStatusHistoryDTO {
    private String oldStatus;
    private String newStatus;
    private String changedByName;
    private String changedByRole;
    private String changedByEmail;
    private LocalDateTime changedAt;
}
