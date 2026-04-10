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

    // 1. View assigned tickets (including RESOLVED)
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
        technicianTicketService.resolveTicket(id, dto.getResolutionNotes(), authentication.getName());
        return ResponseEntity.ok("Ticket successfully resolved.");
    }

    // 3. Edit resolution note for a resolved ticket
    @PatchMapping("/{id}/resolution-note")
    public ResponseEntity<?> updateResolutionNote(
            @PathVariable Long id,
            @RequestBody TechnicianResolutionDTO dto,
            Authentication authentication) {
        technicianTicketService.updateResolutionNote(id, dto.getResolutionNotes(), authentication.getName());
        return ResponseEntity.ok("Resolution note updated successfully.");
    }

    // 4. Delete resolution note for a resolved ticket
    @DeleteMapping("/{id}/resolution-note")
    public ResponseEntity<?> deleteResolutionNote(@PathVariable Long id, Authentication authentication) {
        technicianTicketService.deleteResolutionNote(id, authentication.getName());
        return ResponseEntity.ok("Resolution note deleted successfully.");
    }
}