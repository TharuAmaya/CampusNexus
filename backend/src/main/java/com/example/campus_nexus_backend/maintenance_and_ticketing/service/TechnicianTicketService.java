package com.example.campus_nexus_backend.maintenance_and_ticketing.service;

import com.example.campus_nexus_backend.auth.User;
import com.example.campus_nexus_backend.auth.UserRepository;
import com.example.campus_nexus_backend.maintenance_and_ticketing.dto.ticket.TicketSummaryDTO;
import com.example.campus_nexus_backend.maintenance_and_ticketing.model.entity.Ticket;
import com.example.campus_nexus_backend.maintenance_and_ticketing.model.entity.TicketStatusHistory;
import com.example.campus_nexus_backend.maintenance_and_ticketing.repository.TicketRepository;
import com.example.campus_nexus_backend.maintenance_and_ticketing.repository.TicketStatusHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TechnicianTicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private TicketStatusHistoryRepository statusHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    // 1. Get assigned tickets for this technician, excluding OPEN and REJECTED tickets
    public List<TicketSummaryDTO> getMyAssignedTickets(String technicianEmail) {
        List<Ticket> tickets = ticketRepository.findByAssignedTo_EmailOrderByCreatedAtDesc(technicianEmail);
        
        return tickets.stream()
                .filter(ticket -> !"OPEN".equals(ticket.getStatus()) && !"REJECTED".equals(ticket.getStatus()))
                .map(ticket -> {
            TicketSummaryDTO dto = new TicketSummaryDTO();
            dto.setTicketId(ticket.getTicketId());
            dto.setCategory(ticket.getCategory());
            dto.setPriority(ticket.getPriority());
            dto.setStatus(ticket.getStatus());
            dto.setCreatedByEmail(ticket.getCreatedBy().getEmail());
            dto.setAssignedToEmail(technicianEmail);
            dto.setCreatedAt(ticket.getCreatedAt());
            return dto;
        }).collect(Collectors.toList());
    }

    // 2. Add Resolution Note & Update Status to RESOLVED
    public void resolveTicket(Long ticketId, String resolutionNotes, String technicianEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User technician = userRepository.findByEmail(technicianEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // --- VALIDATION: Ensure resolution notes exist ---
        if (resolutionNotes == null || resolutionNotes.trim().isEmpty()) {
            throw new RuntimeException("Resolution note is required to mark ticket as RESOLVED.");
        }

        // --- VALIDATION: Verify this technician is actually assigned to this ticket before resolving ---
        if (ticket.getAssignedTo() == null || !ticket.getAssignedTo().getEmail().equals(technicianEmail)) {
            throw new RuntimeException("Unauthorized: You can only resolve tickets assigned to you.");
        }

        // --- VALIDATION: Verify status is strictly IN_PROGRESS before allowing resolution ---
        if (!"IN_PROGRESS".equals(ticket.getStatus())) {
            throw new RuntimeException("Action denied: Ticket must be IN_PROGRESS to resolve.");
        }

        String oldStatus = ticket.getStatus();
        ticket.setResolutionNotes(resolutionNotes.trim());
        ticket.setStatus("RESOLVED");
        ticketRepository.save(ticket);

        // [STS_HISTORY] - Creates a status history record for the ticket resolution
        TicketStatusHistory history = new TicketStatusHistory();
        history.setTicket(ticket);
        history.setOldStatus(oldStatus);
        history.setNewStatus("RESOLVED");
        history.setChangedBy(technician);
        statusHistoryRepository.save(history);
    }

    // 3. Edit existing resolution note
    public void updateResolutionNote(Long ticketId, String resolutionNotes, String technicianEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        // --- VALIDATION: Prevent empty note updates ---
        if (resolutionNotes == null || resolutionNotes.trim().isEmpty()) {
            throw new RuntimeException("Resolution note cannot be empty.");
        }

        // --- VALIDATION: Only assigned technician can edit notes ---
        if (ticket.getAssignedTo() == null || !ticket.getAssignedTo().getEmail().equals(technicianEmail)) {
            throw new RuntimeException("Unauthorized: You can only edit resolution notes of tickets assigned to you.");
        }

        // --- VALIDATION: Notes can only be updated if ticket already resolved ---
        if (!"RESOLVED".equals(ticket.getStatus())) {
            throw new RuntimeException("Action denied: Resolution notes can only be edited for RESOLVED tickets.");
        }

        ticket.setResolutionNotes(resolutionNotes.trim());
        ticketRepository.save(ticket);
    }

    // 4. Delete existing resolution note
    public void deleteResolutionNote(Long ticketId, String technicianEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User technician = userRepository.findByEmail(technicianEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // --- VALIDATION: Only assigned technician can delete notes ---
        if (ticket.getAssignedTo() == null || !ticket.getAssignedTo().getEmail().equals(technicianEmail)) {
            throw new RuntimeException("Unauthorized: You can only delete resolution notes of tickets assigned to you.");
        }

        // --- VALIDATION: Deleting resolution note is strictly for RESOLVED state ---
        if (!"RESOLVED".equals(ticket.getStatus())) {
            throw new RuntimeException("Action denied: Resolution notes can only be deleted for RESOLVED tickets.");
        }

        String oldStatus = ticket.getStatus();
        ticket.setResolutionNotes(null);
        ticket.setStatus("IN_PROGRESS");
        ticketRepository.save(ticket);

        // [STS_HISTORY] - Creates a status history record returning from resolved to in progress
        TicketStatusHistory history = new TicketStatusHistory();
        history.setTicket(ticket);
        history.setOldStatus(oldStatus);
        history.setNewStatus("IN_PROGRESS");
        history.setChangedBy(technician);
        statusHistoryRepository.save(history);
    }
}