package com.example.campus_nexus_backend.maintenance_and_ticketing.controller;

import com.example.campus_nexus_backend.maintenance_and_ticketing.dto.comment.TicketCommentRequestDTO;
import com.example.campus_nexus_backend.maintenance_and_ticketing.service.TicketCommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
public class TicketCommentController {

    @Autowired
    private TicketCommentService commentService;

    // 1. Get all comments for a specific ticket
    @GetMapping
    public ResponseEntity<?> getComments(@PathVariable Long ticketId, Authentication authentication) {
        try {
            return ResponseEntity.ok(commentService.getComments(ticketId, authentication.getName()));
        } catch (Exception e) {
            return mapExceptionToResponse(e);
        }
    }

    // 2. Add a new comment to a ticket
    @PostMapping
    public ResponseEntity<?> addComment(
            @PathVariable Long ticketId, 
            @RequestBody TicketCommentRequestDTO dto, 
            Authentication authentication) {
        try {
            commentService.addComment(ticketId, dto, authentication.getName());
            return ResponseEntity.ok("Comment added successfully.");
        } catch (Exception e) {
            return mapExceptionToResponse(e);
        }
    }

    // 3. Update an existing comment
    @PutMapping("/{commentId}")
    public ResponseEntity<?> updateComment(
            @PathVariable Long commentId, 
            @RequestBody TicketCommentRequestDTO dto, 
            Authentication authentication) {
        try {
            commentService.updateComment(commentId, dto, authentication.getName());
            return ResponseEntity.ok("Comment updated successfully.");
        } catch (Exception e) {
            return mapExceptionToResponse(e);
        }
    }

    // 4. Delete an existing comment
    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId, Authentication authentication) {
        try {
            commentService.deleteComment(commentId, authentication.getName());
            return ResponseEntity.ok("Comment deleted successfully.");
        } catch (Exception e) {
            return mapExceptionToResponse(e);
        }
    }

    private ResponseEntity<String> mapExceptionToResponse(Exception e) {
        String message = e.getMessage() == null ? "Request failed" : e.getMessage();

        if (message.toLowerCase().contains("not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(message);
        }

        if (message.toLowerCase().contains("unauthorized") || message.toLowerCase().contains("allowed")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(message);
        }

        if (message.toLowerCase().contains("denied")) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(message);
        }

        return ResponseEntity.badRequest().body(message);
    }
}