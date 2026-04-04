package com.example.campus_nexus_backend.maintenance_and_ticketing.service;

import com.example.campus_nexus_backend.auth.User;
import com.example.campus_nexus_backend.auth.UserRepository;
import com.example.campus_nexus_backend.maintenance_and_ticketing.dto.comment.TicketCommentRequestDTO;
import com.example.campus_nexus_backend.maintenance_and_ticketing.dto.comment.TicketCommentResponseDTO;
import com.example.campus_nexus_backend.maintenance_and_ticketing.model.entity.Ticket;
import com.example.campus_nexus_backend.maintenance_and_ticketing.model.entity.TicketComment;
import com.example.campus_nexus_backend.maintenance_and_ticketing.repository.TicketCommentRepository;
import com.example.campus_nexus_backend.maintenance_and_ticketing.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketCommentService {

    @Autowired
    private TicketCommentRepository commentRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    // Helper: Enforces that ONLY involved Students/Technicians can ADD comments
    private void validateUserAccessToTicket(Ticket ticket, User user) {
        if ("ROLE_ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Action denied: Admins are not allowed to add comments.");
        }
        
        if ("ROLE_STUDENT".equals(user.getRole()) && !ticket.getCreatedBy().getEmail().equals(user.getEmail())) {
            throw new RuntimeException("Unauthorized: You can only comment on your own tickets.");
        }
        
        if ("ROLE_TECHNICIAN".equals(user.getRole())) {
            if (ticket.getAssignedTo() == null || !ticket.getAssignedTo().getEmail().equals(user.getEmail())) {
                throw new RuntimeException("Unauthorized: You can only comment on tickets assigned to you.");
            }
        }
    }

    // 1. Add Comment
    public void addComment(Long ticketId, TicketCommentRequestDTO dto, String userEmail) {
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow(() -> new RuntimeException("Ticket not found"));
        User user = userRepository.findByEmail(userEmail).orElseThrow();

        validateUserAccessToTicket(ticket, user);

        TicketComment comment = new TicketComment();
        comment.setTicket(ticket);
        comment.setUser(user);
        comment.setCommentText(dto.getCommentText());
        commentRepository.save(comment);
    }

    // 2. Get All Comments for a Ticket
    public List<TicketCommentResponseDTO> getComments(Long ticketId, String userEmail) {
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow(() -> new RuntimeException("Ticket not found"));
        User user = userRepository.findByEmail(userEmail).orElseThrow();

        // ONLY validate access if the user is NOT an admin. Admins can see all comments.
        if (!"ROLE_ADMIN".equals(user.getRole())) {
            validateUserAccessToTicket(ticket, user);
        }

        List<TicketComment> comments = commentRepository.findByTicket_TicketIdOrderByCreatedAtAsc(ticketId);
        
        return comments.stream().map(c -> {
            TicketCommentResponseDTO response = new TicketCommentResponseDTO();
            response.setCommentId(c.getCommentId());
            response.setCommentText(c.getCommentText());
            response.setAuthorName(c.getUser().getFullName());
            response.setAuthorEmail(c.getUser().getEmail());
            response.setAuthorRole(c.getUser().getRole());
            response.setCreatedAt(c.getCreatedAt());
            response.setUpdatedAt(c.getUpdatedAt());
            return response;
        }).collect(Collectors.toList());
    }

    // 3. Update Comment
    public void updateComment(Long commentId, TicketCommentRequestDTO dto, String userEmail) {
        TicketComment comment = commentRepository.findById(commentId).orElseThrow(() -> new RuntimeException("Comment not found"));
        
        // Strict ownership check (Tech cannot edit Student comment, Student cannot edit Tech comment)
        if (!comment.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized: You can only edit your own comments.");
        }

        comment.setCommentText(dto.getCommentText());
        commentRepository.save(comment);
    }

    // 4. Delete Comment
    public void deleteComment(Long commentId, String userEmail) {
        TicketComment comment = commentRepository.findById(commentId).orElseThrow(() -> new RuntimeException("Comment not found"));

        // Strict ownership check
        if (!comment.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized: You can only delete your own comments.");
        }

        commentRepository.delete(comment);
    }
}