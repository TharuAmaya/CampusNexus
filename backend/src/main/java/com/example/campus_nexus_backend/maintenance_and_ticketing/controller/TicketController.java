package com.example.campus_nexus_backend.maintenance_and_ticketing.controller;

import com.example.campus_nexus_backend.maintenance_and_ticketing.dto.ticket.TicketRequestDTO;
import com.example.campus_nexus_backend.maintenance_and_ticketing.dto.ticket.TicketResponseDTO;
import com.example.campus_nexus_backend.maintenance_and_ticketing.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

//Lakshan edits notification related
import com.example.campus_nexus_backend.notifications.NotificationService;
import com.example.campus_nexus_backend.auth.UserRepository;
import com.example.campus_nexus_backend.auth.User;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    // --- අපේ අලුත් Services දෙක ---
    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;
    // ----------------------------

    // 1. Create a ticket (Form-Data to support file uploads)
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> createTicket(
            @RequestPart("ticketDetails") TicketRequestDTO ticketDTO,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            Authentication authentication) {
            
        // 1. යාළුවාගේ කෝඩ් එක (මේකෙන් Ticket එක Save වෙනවා)
        ticketService.createTicket(ticketDTO, images, authentication.getName());
        
        // --- අපේ අලුත් Notification කෝඩ් එක පටන් ගන්නවා ---
        try {
            // System එකේ ඉන්න ඔක්කොම Admins ලව හොයාගන්නවා
            List<User> admins = userRepository.findByRole("ROLE_ADMIN");
            
            // හැම Admin ටම වෙන වෙනම Notification එක යවනවා
            for (User admin : admins) {
                notificationService.sendNotification(
                    admin.getEmail(), 
                    "A new ticket has been submitted by " + authentication.getName() + " regarding: " + ticketDTO.getCategory(), 
                    "TICKET"
                );
            }
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }
        // --- අපේ කෝඩ් එක ඉවරයි ---

        return ResponseEntity.status(HttpStatus.CREATED).body("Ticket created successfully!");
    }

    // 2. Get all tickets for the logged-in student
    @GetMapping("/my-tickets")
    public ResponseEntity<List<TicketResponseDTO>> getMyTickets(Authentication authentication) {
        return ResponseEntity.ok(ticketService.getMyTickets(authentication.getName()));
    }

    // 3. Get full details of a specific ticket
    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketDetails(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ticketService.getTicketDetails(id, authentication.getName()));
    }

    // 4. Update an existing ticket
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateTicket(
            @PathVariable Long id,
            @RequestPart("ticketDetails") TicketRequestDTO ticketDTO,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            Authentication authentication) {
        ticketService.updateTicket(id, ticketDTO, images, authentication.getName());
        return ResponseEntity.ok("Ticket updated successfully!");
    }

    // 5. Delete a ticket
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTicket(@PathVariable Long id, Authentication authentication) {
        ticketService.deleteTicket(id, authentication.getName());
        return ResponseEntity.ok("Ticket deleted successfully!");
    }
}