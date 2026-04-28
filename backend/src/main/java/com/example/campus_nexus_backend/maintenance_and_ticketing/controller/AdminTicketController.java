package com.example.campus_nexus_backend.maintenance_and_ticketing.controller;

import com.example.campus_nexus_backend.maintenance_and_ticketing.dto.ticket.AssignTechnicianDTO;
import com.example.campus_nexus_backend.maintenance_and_ticketing.dto.ticket.RejectTicketDTO;
import com.example.campus_nexus_backend.maintenance_and_ticketing.dto.ticket.TicketSummaryDTO;
import com.example.campus_nexus_backend.maintenance_and_ticketing.dto.ticket.UpdateTicketStatusDTO;
import com.example.campus_nexus_backend.maintenance_and_ticketing.service.AdminTicketService;
import com.example.campus_nexus_backend.maintenance_and_ticketing.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

//lakshan edits notification related
// --- Notification Imports ---
import com.example.campus_nexus_backend.notifications.NotificationService;
import com.example.campus_nexus_backend.maintenance_and_ticketing.repository.TicketRepository;
import com.example.campus_nexus_backend.maintenance_and_ticketing.model.entity.Ticket;
import com.example.campus_nexus_backend.auth.UserRepository;
import com.example.campus_nexus_backend.auth.User;


import java.util.List;

@RestController
@RequestMapping("/api/admin/tickets")
public class AdminTicketController {

    @Autowired
    private AdminTicketService adminTicketService;

    @Autowired
    private TicketService ticketService; 


    // ---  Lakshan edits---
    @Autowired
    private NotificationService notificationService;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;
    // ----------------------------------------



    // 1. View all tickets (Summary format)
    @GetMapping
    public ResponseEntity<List<TicketSummaryDTO>> getAllTickets() {
        return ResponseEntity.ok(adminTicketService.getAllTicketsSummary());
    }

    // 2. View specific ticket details (Reusing method from TicketService)
    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketDetails(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ticketService.getTicketDetails(id, authentication.getName()));
    }

    // 3. Assign a technician to a ticket
    // 3. Assign a technician to a ticket  lakshan edits notification related
    @PatchMapping("/{id}")
    public ResponseEntity<?> assignTechnician(
            @PathVariable Long id, 
            @RequestBody AssignTechnicianDTO dto) {
            
        // assign sahiru code part
        adminTicketService.assignTechnician(id, dto.getAssignedTechnicianId());
        
        // --- Notification sending part ---
        try {
            Ticket ticket = ticketRepository.findById(id).orElseThrow();
            User technician = userRepository.findById(dto.getAssignedTechnicianId()).orElseThrow();

            // 1. sending notification to technician
            notificationService.sendNotification(
                technician.getEmail(), 
                "You have been assigned to a new Ticket #" + id, 
                "TICKET"
            );
            
            // 2. sending notification to student
            notificationService.sendNotification(
                ticket.getCreatedBy().getEmail(), 
                "Your Ticket #" + id + " has been assigned to a technician.", 
                "TICKET"
            );
        } catch (Exception e) {
            System.err.println("Failed to send assign notifications: " + e.getMessage());
        }
        // ------------------------------

        return ResponseEntity.ok("Technician assigned successfully.");
    }



    // 4. Reject a ticket  Lakshan edits notification related
    @PatchMapping("/{id}/reject")
    public ResponseEntity<?> rejectTicket(
            @PathVariable Long id, 
            @RequestBody RejectTicketDTO dto,
            Authentication authentication) {
            
        // යාළුවාගේ කෝඩ් එක
        adminTicketService.rejectTicket(id, dto.getRejectionReason(), authentication.getName());
        
        // --- Notification යවන කෑල්ල ---
        try {
            Ticket ticket = ticketRepository.findById(id).orElseThrow();
            
            // Student ට Notification එකක් යවනවා
            notificationService.sendNotification(
                ticket.getCreatedBy().getEmail(), 
                "Your Ticket #" + id + " has been REJECTED. Reason: " + dto.getRejectionReason(), 
                "TICKET"
            );
        } catch (Exception e) {
            System.err.println("Failed to send reject notification: " + e.getMessage());
        }
        // ------------------------------

        return ResponseEntity.ok("Ticket has been rejected.");
    }




    // 4b. Cancel rejection for a ticket
    @PatchMapping("/{id}/cancel-rejection")
    public ResponseEntity<?> cancelRejection(
            @PathVariable Long id,
            Authentication authentication) {
        adminTicketService.cancelRejection(id, authentication.getName());
        return ResponseEntity.ok("Ticket rejection cancelled.");
    }

    // 5. Manually update ticket status
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateTicketStatus(
            @PathVariable Long id,
            @RequestBody UpdateTicketStatusDTO dto,
            Authentication authentication) {
        adminTicketService.updateTicketStatus(id, dto.getNewStatus(), authentication.getName());
        return ResponseEntity.ok("Ticket status manually updated to " + dto.getNewStatus());
    }

    // 6. Delete a closed ticket
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClosedTicket(@PathVariable Long id) {
        adminTicketService.deleteClosedTicket(id);
        return ResponseEntity.ok("CLOSED ticket deleted successfully.");
    }
}