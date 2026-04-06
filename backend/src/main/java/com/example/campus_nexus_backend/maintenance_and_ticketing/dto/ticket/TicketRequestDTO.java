package com.example.campus_nexus_backend.maintenance_and_ticketing.dto.ticket;

import lombok.Data;

@Data
public class TicketRequestDTO {
    private Long resourceId;
    private String category;
    private String description;
    private String priority;
    private String preferredContact;
}