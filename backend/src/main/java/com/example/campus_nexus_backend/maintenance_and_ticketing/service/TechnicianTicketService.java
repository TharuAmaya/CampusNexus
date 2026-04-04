package com.example.campus_nexus_backend.maintenance_and_ticketing.service;

import com.example.campus_nexus_backend.maintenance_and_ticketing.dto.ticket.TicketSummaryDTO;
import com.example.campus_nexus_backend.maintenance_and_ticketing.model.entity.Ticket;
import com.example.campus_nexus_backend.maintenance_and_ticketing.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TechnicianTicketService {

    @Autowired
    private TicketRepository ticketRepository;

    // 1. Get ONLY assigned IN_PROGRESS tickets for this technician
    public List<TicketSummaryDTO> getMyAssignedTickets(String technicianEmail) {
        List<Ticket> tickets = ticketRepository.findByAssignedTo_EmailAndStatus(technicianEmail, "IN_PROGRESS");
        
        return tickets.stream().map(ticket -> {
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

        // Verify this technician is assigned to this ticket
        if (ticket.getAssignedTo() == null || !ticket.getAssignedTo().getEmail().equals(technicianEmail)) {
            throw new RuntimeException("Unauthorized: You can only resolve tickets assigned to you.");
        }

        // Verify status is IN_PROGRESS
        if (!"IN_PROGRESS".equals(ticket.getStatus())) {
            throw new RuntimeException("Action denied: Ticket must be IN_PROGRESS to resolve.");
        }

        ticket.setResolutionNotes(resolutionNotes);
        ticket.setStatus("RESOLVED");
        ticketRepository.save(ticket);
    }
}