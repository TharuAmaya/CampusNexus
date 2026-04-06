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

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    // 1. Create a ticket (Form-Data to support file uploads)
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> createTicket(
            @RequestPart("ticketDetails") TicketRequestDTO ticketDTO,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            Authentication authentication) {
        try {
            ticketService.createTicket(ticketDTO, images, authentication.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body("Ticket created successfully!");
        } catch (Exception e) {
            return mapExceptionToResponse(e);
        }
    }

    // 2. Get all tickets for the logged-in student
    @GetMapping("/my-tickets")
    public ResponseEntity<List<TicketResponseDTO>> getMyTickets(Authentication authentication) {
        return ResponseEntity.ok(ticketService.getMyTickets(authentication.getName()));
    }

    // 3. Get full details of a specific ticket
    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketDetails(@PathVariable Long id, Authentication authentication) {
        try {
            return ResponseEntity.ok(ticketService.getTicketDetails(id, authentication.getName()));
        } catch (Exception e) {
            return mapExceptionToResponse(e);
        }
    }

    // 4. Update an existing ticket
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateTicket(
            @PathVariable Long id,
            @RequestPart("ticketDetails") TicketRequestDTO ticketDTO,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            Authentication authentication) {
        try {
            ticketService.updateTicket(id, ticketDTO, images, authentication.getName());
            return ResponseEntity.ok("Ticket updated successfully!");
        } catch (Exception e) {
            return mapExceptionToResponse(e);
        }
    }

    // 5. Delete a ticket
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTicket(@PathVariable Long id, Authentication authentication) {
        try {
            ticketService.deleteTicket(id, authentication.getName());
            return ResponseEntity.ok("Ticket deleted successfully!");
        } catch (Exception e) {
            return mapExceptionToResponse(e);
        }
    }

    private ResponseEntity<String> mapExceptionToResponse(Exception e) {
        String message = e.getMessage() == null ? "Request failed" : e.getMessage();

        if (message.toLowerCase().contains("not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(message);
        }

        if (message.toLowerCase().contains("unauthorized") || message.toLowerCase().contains("only")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(message);
        }

        if (message.toLowerCase().contains("denied")) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(message);
        }

        return ResponseEntity.badRequest().body(message);
    }
}