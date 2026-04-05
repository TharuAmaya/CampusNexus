package com.example.campus_nexus_backend.maintenance_and_ticketing.service;

import com.example.campus_nexus_backend.auth.User;
import com.example.campus_nexus_backend.auth.UserRepository;
import com.example.campus_nexus_backend.maintenance_and_ticketing.dto.ticket.TechnicianListItemDTO;
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

    // 2. Get all technicians for assignment dropdown/list
    public List<TechnicianListItemDTO> getAllTechnicians() {
        return userRepository.findByRole("ROLE_TECHNICIAN").stream().map(user -> {
            TechnicianListItemDTO dto = new TechnicianListItemDTO();
            dto.setId(user.getId());
            dto.setFullName(user.getFullName());
            dto.setEmail(user.getEmail());
            dto.setDepartment(user.getDepartment());
            dto.setRole(user.getRole());
            return dto;
        }).collect(Collectors.toList());
    }

    // 3. Assign technician to ticket (status is updated manually through status endpoint)
    public void assignTechnician(Long ticketId, Long technicianId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if ("CLOSED".equals(ticket.getStatus()) || "REJECTED".equals(ticket.getStatus())) {
            throw new RuntimeException("Cannot assign technicians to CLOSED or REJECTED tickets.");
        }
        
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found"));

        if (!"ROLE_TECHNICIAN".equals(technician.getRole())) {
            throw new RuntimeException("User is not a technician!");
        }

        ticket.setAssignedTo(technician);
        ticketRepository.save(ticket);
    }

    // 4. Reject Ticket
    public void rejectTicket(Long ticketId, String reason) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if ("CLOSED".equals(ticket.getStatus())) {
            throw new RuntimeException("Cannot reject a CLOSED ticket.");
        }

        ticket.setStatus("REJECTED");
        ticket.setRejectionReason(reason);
        ticketRepository.save(ticket);
    }

    // 5. Manually Update Status
    public void updateTicketStatus(Long ticketId, String newStatus) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        String normalizedStatus = newStatus.toUpperCase();

        // Validate that the status is one of the allowed values
        List<String> allowedStatuses = List.of("OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED");
        if (!allowedStatuses.contains(normalizedStatus)) {
            throw new RuntimeException("Invalid status value. Allowed: OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED");
        }

        if ("IN_PROGRESS".equals(normalizedStatus) && ticket.getAssignedTo() == null) {
            throw new RuntimeException("Assign a technician before setting status to IN_PROGRESS.");
        }

        ticket.setStatus(normalizedStatus);
        ticketRepository.save(ticket);
    }

    // 6. Delete CLOSED Ticket ONLY
    public void deleteClosedTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (!"CLOSED".equals(ticket.getStatus())) {
            throw new RuntimeException("Action denied: Admins can only delete tickets with a 'CLOSED' status.");
        }

        ticketRepository.delete(ticket);
    }
}