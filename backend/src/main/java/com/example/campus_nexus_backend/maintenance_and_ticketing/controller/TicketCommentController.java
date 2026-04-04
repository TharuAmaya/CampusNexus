package com.example.campus_nexus_backend.maintenance_and_ticketing.controller;

import com.example.campus_nexus_backend.maintenance_and_ticketing.dto.comment.TicketCommentRequestDTO;
import com.example.campus_nexus_backend.maintenance_and_ticketing.service.TicketCommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class TicketCommentController {

    @Autowired
    private TicketCommentService commentService;

    // 1. Get all comments for a specific ticket
    @GetMapping("/tickets/{ticketId}/comments")
    public ResponseEntity<?> getComments(@PathVariable Long ticketId, Authentication authentication) {
        try {
            return ResponseEntity.ok(commentService.getComments(ticketId, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. Add a new comment to a ticket
    @PostMapping("/tickets/{ticketId}/comments")
    public ResponseEntity<?> addComment(
            @PathVariable Long ticketId, 
            @RequestBody TicketCommentRequestDTO dto, 
            Authentication authentication) {
        try {
            commentService.addComment(ticketId, dto, authentication.getName());
            return ResponseEntity.ok("Comment added successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 3. Update an existing comment
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<?> updateComment(
            @PathVariable Long commentId, 
            @RequestBody TicketCommentRequestDTO dto, 
            Authentication authentication) {
        try {
            commentService.updateComment(commentId, dto, authentication.getName());
            return ResponseEntity.ok("Comment updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 4. Delete an existing comment
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId, Authentication authentication) {
        try {
            commentService.deleteComment(commentId, authentication.getName());
            return ResponseEntity.ok("Comment deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}