package com.example.campus_nexus_backend.maintenance_and_ticketing.repository;

import com.example.campus_nexus_backend.maintenance_and_ticketing.model.entity.TicketAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketAttachmentRepository extends JpaRepository<TicketAttachment, Long> {
    // Fetches all attachments for a specific ticket
    List<TicketAttachment> findByTicket_TicketId(Long ticketId);
}