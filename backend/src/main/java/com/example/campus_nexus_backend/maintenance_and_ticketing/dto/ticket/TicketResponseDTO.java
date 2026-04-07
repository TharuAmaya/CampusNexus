package com.example.campus_nexus_backend.maintenance_and_ticketing.dto.ticket;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import com.example.campus_nexus_backend.maintenance_and_ticketing.dto.attachment.AttachmentDTO;

@Data
public class TicketResponseDTO {
    private Long ticketId;
    private Long resourceId;
    private String category;
    private String description;
    private String priority;
    private String preferredContact;
    private String status;
    private String resolutionNotes;
    private LocalDateTime createdAt;
    private String assignedToEmail;
    private String createdByEmail;
    
    // To send attachment details back to the frontend
    private List<AttachmentDTO> attachments;

    // Read-only timeline of all status transitions for this ticket
    private List<TicketStatusHistoryDTO> statusHistory;
}