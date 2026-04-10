package com.example.campus_nexus_backend.maintenance_and_ticketing.controller;

import com.example.campus_nexus_backend.maintenance_and_ticketing.dto.comment.TicketCommentRequestDTO;
import com.example.campus_nexus_backend.maintenance_and_ticketing.service.TicketCommentService;
import org.springframework.beans.factory.annotation.Autowired;
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
        return ResponseEntity.ok(commentService.getComments(ticketId, authentication.getName()));
    }

    // 2. Add a new comment to a ticket
    @PostMapping
    public ResponseEntity<?> addComment(
            @PathVariable Long ticketId, 
            @RequestBody TicketCommentRequestDTO dto, 
            Authentication authentication) {
        commentService.addComment(ticketId, dto, authentication.getName());
        return ResponseEntity.ok("Comment added successfully.");
    }

    // 3. Update an existing comment
    @PutMapping("/{commentId}")
    public ResponseEntity<?> updateComment(
            @PathVariable Long commentId, 
            @RequestBody TicketCommentRequestDTO dto, 
            Authentication authentication) {
        commentService.updateComment(commentId, dto, authentication.getName());
        return ResponseEntity.ok("Comment updated successfully.");
    }

    // 4. Delete an existing comment
    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId, Authentication authentication) {
        commentService.deleteComment(commentId, authentication.getName());
        return ResponseEntity.ok("Comment deleted successfully.");
    }
}