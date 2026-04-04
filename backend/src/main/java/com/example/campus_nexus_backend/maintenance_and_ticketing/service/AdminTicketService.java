package com.example.campus_nexus_backend.maintenance_and_ticketing.service;

import com.example.campus_nexus_backend.auth.User;
import com.example.campus_nexus_backend.auth.UserRepository;
import com.example.campus_nexus_backend.maintenance_and_ticketing.dto.ticket.TicketSummaryDTO;
import com.example.campus_nexus_backend.maintenance_and_ticketing.model.entity.Ticket;
import com.example.campus_nexus_backend.maintenance_and_ticketing.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminTicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    // 1. Get All Tickets (Summary format for the table)
    public List<TicketSummaryDTO> getAllTicketsSummary() {
        return ticketRepository.findAll().stream().map(ticket -> {
            TicketSummaryDTO dto = new TicketSummaryDTO();
            dto.setTicketId(ticket.getTicketId());
            dto.setCategory(ticket.getCategory());
            dto.setPriority(ticket.getPriority());
            dto.setStatus(ticket.getStatus());
            dto.setCreatedByEmail(ticket.getCreatedBy().getEmail());
            dto.setAssignedToEmail(ticket.getAssignedTo() != null ? ticket.getAssignedTo().getEmail() : "Unassigned");
            dto.setCreatedAt(ticket.getCreatedAt());
            return dto;
        }).collect(Collectors.toList());
    }

    // 2. Assign Technician & Automatically Set to IN_PROGRESS
    public void assignTechnician(Long ticketId, Long technicianId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found"));

        if (!"ROLE_TECHNICIAN".equals(technician.getRole())) {
            throw new RuntimeException("User is not a technician!");
        }

        ticket.setAssignedTo(technician);
        ticket.setStatus("IN_PROGRESS");
        ticketRepository.save(ticket);
    }

    // 3. Reject Ticket
    public void rejectTicket(Long ticketId, String reason) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setStatus("REJECTED");
        ticket.setRejectionReason(reason);
        ticketRepository.save(ticket);
    }

    // 4. Manually Update Status (NEW)
    public void updateTicketStatus(Long ticketId, String newStatus) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        // Validate that the status is one of the allowed values
        List<String> allowedStatuses = List.of("OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED");
        if (!allowedStatuses.contains(newStatus.toUpperCase())) {
            throw new RuntimeException("Invalid status value. Allowed: OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED");
        }

        ticket.setStatus(newStatus.toUpperCase());
        ticketRepository.save(ticket);
    }

    // 5. Delete CLOSED Ticket ONLY
    public void deleteClosedTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (!"CLOSED".equals(ticket.getStatus())) {
            throw new RuntimeException("Action denied: Admins can only delete tickets with a 'CLOSED' status.");
        }

        ticketRepository.delete(ticket);
    }
}