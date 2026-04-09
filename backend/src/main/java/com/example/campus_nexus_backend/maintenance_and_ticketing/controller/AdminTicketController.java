package com.example.campus_nexus_backend.maintenance_and_ticketing.controller;

import com.example.campus_nexus_backend.maintenance_and_ticketing.dto.ticket.AdminTicketPatchDTO;
import com.example.campus_nexus_backend.maintenance_and_ticketing.dto.ticket.TicketSummaryDTO;
import com.example.campus_nexus_backend.maintenance_and_ticketing.dto.ticket.UpdateTicketStatusDTO;
import com.example.campus_nexus_backend.maintenance_and_ticketing.service.AdminTicketService;
import com.example.campus_nexus_backend.maintenance_and_ticketing.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/tickets")
public class AdminTicketController {

    @Autowired
    private AdminTicketService adminTicketService;

    @Autowired
    private TicketService ticketService; 

    // 1. View all tickets (Summary format)
    @GetMapping
    public ResponseEntity<List<TicketSummaryDTO>> getAllTickets() {
        return ResponseEntity.ok(adminTicketService.getAllTicketsSummary());
    }

    // 2. View specific ticket details (Reusing method from TicketService)
    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketDetails(@PathVariable Long id, Authentication authentication) {
        try {
            return ResponseEntity.ok(ticketService.getTicketDetails(id, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 3. Patch ticket fields (assignment and status/rejection)
    @PatchMapping("/{id}")
    public ResponseEntity<?> patchTicket(
            @PathVariable Long id, 
            @RequestBody AdminTicketPatchDTO dto,
            Authentication authentication) {
        try {
            if (dto.getAssignedTechnicianId() != null) {
                adminTicketService.assignTechnician(id, dto.getAssignedTechnicianId());
                return ResponseEntity.ok("Technician assigned successfully.");
            }

            if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
                String normalizedStatus = dto.getStatus().trim().toUpperCase().replace("-", "_");

                if ("REJECTED".equals(normalizedStatus)) {
                    adminTicketService.rejectTicket(id, dto.getRejectionReason(), authentication.getName());
                    return ResponseEntity.ok("Ticket has been rejected.");
                }

                adminTicketService.updateTicketStatus(id, dto.getStatus(), authentication.getName());
                return ResponseEntity.ok("Ticket status manually updated to " + dto.getStatus());
            }

            return ResponseEntity.badRequest().body("Request must include assignedTechnicianId or status.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 4. Manually update ticket status
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateTicketStatus(
            @PathVariable Long id,
            @RequestBody UpdateTicketStatusDTO dto,
            Authentication authentication) {
        try {
            adminTicketService.updateTicketStatus(id, dto.getNewStatus(), authentication.getName());
            return ResponseEntity.ok("Ticket status manually updated to " + dto.getNewStatus());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 5. Delete a closed ticket
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClosedTicket(@PathVariable Long id) {
        try {
            adminTicketService.deleteClosedTicket(id);
            return ResponseEntity.ok("CLOSED ticket deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}