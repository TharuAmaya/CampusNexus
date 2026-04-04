package com.example.campus_nexus_backend.maintenance_and_ticketing.controller;

import com.example.campus_nexus_backend.maintenance_and_ticketing.dto.ticket.TechnicianResolutionDTO;
import com.example.campus_nexus_backend.maintenance_and_ticketing.dto.ticket.TicketSummaryDTO;
import com.example.campus_nexus_backend.maintenance_and_ticketing.service.TechnicianTicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technician/tickets")
public class TechnicianTicketController {

    @Autowired
    private TechnicianTicketService technicianTicketService;

    // 1. View assigned IN_PROGRESS tickets
    @GetMapping
    public ResponseEntity<List<TicketSummaryDTO>> getAssignedTickets(Authentication authentication) {
        return ResponseEntity.ok(technicianTicketService.getMyAssignedTickets(authentication.getName()));
    }

    // 2. Add Resolution Notes & Mark RESOLVED
    @PatchMapping("/{id}/resolve")
    public ResponseEntity<?> resolveTicket(
            @PathVariable Long id, 
            @RequestBody TechnicianResolutionDTO dto, 
            Authentication authentication) {
        try {
            technicianTicketService.resolveTicket(id, dto.getResolutionNotes(), authentication.getName());
            return ResponseEntity.ok("Ticket successfully resolved.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}