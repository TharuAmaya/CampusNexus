package com.example.campus_nexus_backend.maintenance_and_ticketing.dto.ticket;

import lombok.Data;

@Data
public class TechnicianListItemDTO {
    private Long id;
    private String fullName;
    private String email;
    private String department;
    private String role;
}
