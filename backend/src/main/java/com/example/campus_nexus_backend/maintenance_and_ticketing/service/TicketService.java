package com.example.campus_nexus_backend.maintenance_and_ticketing.service;

import com.example.campus_nexus_backend.auth.User;
import com.example.campus_nexus_backend.auth.UserRepository;
import com.example.campus_nexus_backend.maintenance_and_ticketing.dto.attachment.AttachmentDTO;
import com.example.campus_nexus_backend.maintenance_and_ticketing.dto.ticket.TicketRequestDTO;
import com.example.campus_nexus_backend.maintenance_and_ticketing.dto.ticket.TicketResponseDTO;
import com.example.campus_nexus_backend.maintenance_and_ticketing.dto.ticket.TicketStatusHistoryDTO;
import com.example.campus_nexus_backend.maintenance_and_ticketing.model.entity.Ticket;
import com.example.campus_nexus_backend.maintenance_and_ticketing.model.entity.TicketAttachment;
import com.example.campus_nexus_backend.maintenance_and_ticketing.model.entity.TicketStatusHistory;
import com.example.campus_nexus_backend.maintenance_and_ticketing.repository.TicketAttachmentRepository;
import com.example.campus_nexus_backend.maintenance_and_ticketing.repository.TicketRepository;
import com.example.campus_nexus_backend.maintenance_and_ticketing.repository.TicketStatusHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private TicketAttachmentRepository attachmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TicketStatusHistoryRepository statusHistoryRepository;

    private final String UPLOAD_DIR = "uploads/tickets/";

    // 1. Create Ticket
    public void createTicket(TicketRequestDTO dto, List<MultipartFile> files, String userEmail) throws IOException {
        User student = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!student.getRole().equals("ROLE_STUDENT")) {
            throw new RuntimeException("Only students can create tickets.");
        }

        // Check attachment limit
        if (files != null && files.size() > 3) {
            throw new RuntimeException("Maximum of 3 image attachments allowed.");
        }

        Ticket ticket = new Ticket();
        ticket.setCreatedBy(student);
        ticket.setResourceId(dto.getResourceId());
        ticket.setCategory(dto.getCategory());
        ticket.setDescription(dto.getDescription());
        ticket.setPriority(dto.getPriority());
        ticket.setPreferredContact(dto.getPreferredContact());
        ticket.setStatus("OPEN"); // Enforcing OPEN status

        Ticket savedTicket = ticketRepository.save(ticket);

        // Handle File Uploads
        if (files != null && !files.isEmpty()) {
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) uploadDir.mkdirs();

            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                    Path filePath = Paths.get(UPLOAD_DIR + fileName);
                    Files.copy(file.getInputStream(), filePath);

                    TicketAttachment attachment = new TicketAttachment();
                    attachment.setTicket(savedTicket);
                    attachment.setFileName(file.getOriginalFilename());
                    attachment.setFilePath(filePath.toString());
                    attachmentRepository.save(attachment);
                }
            }
        }
    }

    // 2. Get All Tickets for Logged In Student (Basic details for the list)
    public List<TicketResponseDTO> getMyTickets(String userEmail) {
        List<Ticket> tickets = ticketRepository.findByCreatedBy_EmailOrderByCreatedAtDesc(userEmail);
        return tickets.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    // 3. Get Specific Ticket Details (With strict role-based ownership check)
    public TicketResponseDTO getTicketDetails(Long ticketId, String userEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User requestingUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Rule 1: Students can ONLY view their own tickets
        if ("ROLE_STUDENT".equals(requestingUser.getRole())) {
            if (!ticket.getCreatedBy().getEmail().equals(userEmail)) {
                throw new RuntimeException("Unauthorized: You can only view your own tickets.");
            }
        }

        // Rule 2: Technicians can ONLY view tickets explicitly assigned to them
        if ("ROLE_TECHNICIAN".equals(requestingUser.getRole())) {
            if (ticket.getAssignedTo() == null || !ticket.getAssignedTo().getEmail().equals(userEmail)) {
                throw new RuntimeException("Unauthorized: You can only view tickets assigned to you.");
            }
        }

        // Admins automatically bypass the above checks and reach this return statement
        return mapToResponseDTO(ticket);
    }

    // 4. Update Ticket (including attachment replacement)
    @Transactional(rollbackFor = Exception.class)
    public void updateTicket(Long ticketId, TicketRequestDTO dto, List<MultipartFile> files, String userEmail) throws IOException {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (!ticket.getCreatedBy().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized: You can only edit your own tickets");
        }

        if (!"OPEN".equals(ticket.getStatus())) {
            throw new RuntimeException("Action denied: You can only edit tickets that are currently OPEN.");
        }

        if (files != null && files.size() > 3) {
            throw new RuntimeException("Maximum of 3 image attachments allowed.");
        }

        ticket.setResourceId(dto.getResourceId());
        ticket.setCategory(dto.getCategory());
        ticket.setDescription(dto.getDescription());
        ticket.setPriority(dto.getPriority());
        ticket.setPreferredContact(dto.getPreferredContact());

        ticketRepository.save(ticket);

        // Requirement: replace attachments during update
        List<TicketAttachment> existingAttachments = attachmentRepository.findByTicket_TicketId(ticketId);
        for (TicketAttachment attachment : existingAttachments) {
            if (attachment.getFilePath() != null && !attachment.getFilePath().isBlank()) {
                try {
                    Files.deleteIfExists(Paths.get(attachment.getFilePath()));
                } catch (IOException ignored) {
                    // Keep update robust even if one old file is already missing on disk.
                }
            }
        }
        attachmentRepository.deleteByTicket_TicketId(ticketId);

        if (files != null && !files.isEmpty()) {
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) {
                    continue;
                }

                String safeOriginalName = file.getOriginalFilename() == null ? "attachment" : file.getOriginalFilename();
                String fileName = UUID.randomUUID() + "_" + safeOriginalName;
                Path filePath = Paths.get(UPLOAD_DIR, fileName);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                TicketAttachment attachment = new TicketAttachment();
                attachment.setTicket(ticket);
                attachment.setFileName(safeOriginalName);
                attachment.setFilePath(filePath.toString());
                attachmentRepository.save(attachment);
            }
        }
    }

    // 5. Delete Ticket
    public void deleteTicket(Long ticketId, String userEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        // 1. Check if the user owns the ticket
        if (!ticket.getCreatedBy().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized: You can only delete your own tickets");
        }

        // 2. NEW RULE: Check if the status is OPEN
        if (!"OPEN".equals(ticket.getStatus())) {
            throw new RuntimeException("Action denied: You can only delete tickets that are currently OPEN.");
        }

        // If both checks pass, delete it
        ticketRepository.delete(ticket);
    }

    // Helper method to map Entity to DTO
    private TicketResponseDTO mapToResponseDTO(Ticket ticket) {
        TicketResponseDTO dto = new TicketResponseDTO();
        dto.setTicketId(ticket.getTicketId());
        dto.setResourceId(ticket.getResourceId());
        dto.setCategory(ticket.getCategory());
        dto.setDescription(ticket.getDescription());
        dto.setPriority(ticket.getPriority());
        dto.setPreferredContact(ticket.getPreferredContact());
        dto.setStatus(ticket.getStatus());
        dto.setResolutionNotes(ticket.getResolutionNotes());
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setAssignedToEmail(ticket.getAssignedTo() != null ? ticket.getAssignedTo().getEmail() : null);

        List<TicketAttachment> attachments = attachmentRepository.findByTicket_TicketId(ticket.getTicketId());
        List<AttachmentDTO> attachmentDTOs = new ArrayList<>();
        
        for (TicketAttachment att : attachments) {
            AttachmentDTO attDto = new AttachmentDTO();
            attDto.setAttachmentId(att.getAttachmentId());
            attDto.setFileName(att.getFileName());
            attDto.setFilePath(att.getFilePath());
            attachmentDTOs.add(attDto);
        }
        dto.setAttachments(attachmentDTOs);

        List<TicketStatusHistory> statusHistoryRows = statusHistoryRepository
                .findByTicket_TicketIdOrderByChangedAtAsc(ticket.getTicketId());
        List<TicketStatusHistoryDTO> statusHistory = new ArrayList<>();

        for (TicketStatusHistory row : statusHistoryRows) {
            TicketStatusHistoryDTO historyDTO = new TicketStatusHistoryDTO();
            historyDTO.setOldStatus(row.getOldStatus());
            historyDTO.setNewStatus(row.getNewStatus());
            historyDTO.setChangedByName(row.getChangedBy().getFullName());
            historyDTO.setChangedByRole(row.getChangedBy().getRole());
            historyDTO.setChangedByEmail(row.getChangedBy().getEmail());
            historyDTO.setChangedAt(row.getChangedAt());
            statusHistory.add(historyDTO);
        }
        dto.setStatusHistory(statusHistory);

        return dto;
    }
}