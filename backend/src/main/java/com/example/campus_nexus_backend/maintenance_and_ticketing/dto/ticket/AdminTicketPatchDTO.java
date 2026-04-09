package com.example.campus_nexus_backend.maintenance_and_ticketing.dto.ticket;

import lombok.Data;

@Data
public class AdminTicketPatchDTO {
    private Long assignedTechnicianId;
    private String status;
    private String rejectionReason;
}