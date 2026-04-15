package com.example.campus_nexus_backend.maintenance_and_ticketing.controller;

import com.example.campus_nexus_backend.maintenance_and_ticketing.dto.ticket.TechnicianResolutionDTO;
import com.example.campus_nexus_backend.maintenance_and_ticketing.dto.ticket.TicketSummaryDTO;
import com.example.campus_nexus_backend.maintenance_and_ticketing.service.TechnicianTicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

//lakshan edits notification related 
// --- Notification Imports ---
import com.example.campus_nexus_backend.notifications.NotificationService;
import com.example.campus_nexus_backend.maintenance_and_ticketing.repository.TicketRepository;
import com.example.campus_nexus_backend.maintenance_and_ticketing.model.entity.Ticket;

import java.util.List;

@RestController
@RequestMapping("/api/technician/tickets")
public class TechnicianTicketController {

    @Autowired
    private TechnicianTicketService technicianTicketService;


    // --- අපේ අලුත් Services --- notification related Lakshan edits
    @Autowired
    private NotificationService notificationService;

    @Autowired
    private TicketRepository ticketRepository;
    // ------------------------


    // 1. View assigned tickets (including RESOLVED)
    @GetMapping
    public ResponseEntity<List<TicketSummaryDTO>> getAssignedTickets(Authentication authentication) {
        return ResponseEntity.ok(technicianTicketService.getMyAssignedTickets(authentication.getName()));
    }

    // 2. Add Resolution Notes & Mark RESOLVED
   // 2. Add Resolution Notes & Mark RESOLVED
    @PatchMapping("/{id}/resolve")
    public ResponseEntity<?> resolveTicket(
            @PathVariable Long id, 
            @RequestBody TechnicianResolutionDTO dto, 
            Authentication authentication) {
            
        // යාළුවාගේ කෝඩ් එක
        technicianTicketService.resolveTicket(id, dto.getResolutionNotes(), authentication.getName());
        
        // --- Notification යවන කෑල්ල ---
        try {
            Ticket ticket = ticketRepository.findById(id).orElseThrow();
            
            // Ticket එක දාපු Student ට Notification එක යවනවා
            notificationService.sendNotification(
                ticket.getCreatedBy().getEmail(), 
                "Great news! Your Ticket #" + id + " has been RESOLVED by the technician. Notes: " + dto.getResolutionNotes(), 
                "TICKET"
            );
        } catch (Exception e) {
            System.err.println("Failed to send resolve notification: " + e.getMessage());
        }
        // ------------------------------

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